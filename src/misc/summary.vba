Dim workplan As New workplan

'Define some global variables that contain the key values for all settings
Dim reportingWeeksSetting As Integer
Dim progressTresholdSetting As Double
Dim tasksBehindCountSetting As Integer
Dim tasksLateCountSetting As Integer
Dim separateRemarksRisksSetting As Boolean
Dim taskBehindStatusSetting As Integer
Dim taskOutStatusSetting As Integer
Dim reportingFilePathSetting As String
Dim showErrorMessagesSetting As Boolean

Public Sub CopyReport()
  If Not workplan.projectId <> "" Then
    MsgBox "Select a project first!"
    Exit Sub
  End If
  
  Application.ScreenUpdating = False
  
  CleanReport
  
  ThisWorkbook.Sheets("Report").Activate

  GenerateReport
  Application.ScreenUpdating = True
  'Debug.Print workplan.toString
End Sub

Public Sub CopyReportAgain()

  Dim reportSheet As Worksheet
  Set reportSheet = ThisWorkbook.Sheets("Report")
  
  Dim rowCount As Integer: rowCount = reportSheet.Cells(reportSheet.Rows.count, 2).End(xlUp).row
  
  reportSheet.Range("B3:I" & rowCount).CopyPicture xlScreen, xlPicture
End Sub

Public Sub CleanReport()

  Dim reportSheet As Worksheet
  Set reportSheet = ThisWorkbook.Sheets("Report")
  
  Dim projectNameRange As Range: Set projectNameRange = reportSheet.Range("B3")
  Dim projectStatusRange As Range: Set projectStatusRange = reportSheet.Range("G3")
  Dim projectProgressRange As Range: Set projectProgressRange = reportSheet.Range("I3")
  Dim projectAccHeaderRange As Range: Set projectAccHeaderRange = reportSheet.Range("B4")
  Dim projectAccomplishmentsRange As Range: Set projectAccomplishmentsRange = reportSheet.Range("B5")
  
  projectNameRange.value = ""
  projectStatusRange.value = ""
  projectProgressRange.value = ""
  projectAccHeaderRange.value = ""
  projectAccomplishmentsRange.value = ""

  reportSheet.Rows(5).RowHeight = 15
  reportSheet.Rows(6).RowHeight = 15
  reportSheet.Rows(7).RowHeight = 15
  reportSheet.Rows(8).RowHeight = 15
  reportSheet.Rows(9).RowHeight = 15

  Dim rowCount As Integer: rowCount = reportSheet.Cells(reportSheet.Rows.count, 2).End(xlUp).row
  
  If rowCount > 11 Then
    reportSheet.Range("B" & 11 & ":I" & rowCount).value = ""
  End If

End Sub

Private Sub GenerateReport()

  Dim currentWeek As Integer: currentWeek = CInt(Split(Fiscal(Date), ":")(2))

  Dim reportSheet As Worksheet
  Set reportSheet = ThisWorkbook.Sheets("Report")
  
  Dim projectNameRange As Range: Set projectNameRange = reportSheet.Range("B3")
  Dim projectProgressRange As Range: Set projectProgressRange = reportSheet.Range("G3")
  Dim projectStatusRange As Range: Set projectStatusRange = reportSheet.Range("I3")
  Dim projectAccHeaderRange As Range: Set projectAccHeaderRange = reportSheet.Range("B4")
  Dim projectAccomplishmentsRange As Range: Set projectAccomplishmentsRange = reportSheet.Range("B5")
  
  projectNameRange.value = workplan.projectName
  projectProgressRange.value = getProjectStatusString(workplan.projectStatus)
  projectStatusRange.value = workplan.projectProgress
  projectAccHeaderRange.value = "Accomplishments (WK" & currentWeek & ")"
  
  Dim accString As String: accString = GenerateReportAccomplishments
  
  Dim count As Integer
  
  count = UBound(Split(accString, Chr(10)))
  
  If count > 6 Then
    Dim diff As Integer: diff = count - 6
    
    reportSheet.Rows(5).RowHeight = 15 + (diff * 3)
    reportSheet.Rows(6).RowHeight = 15 + (diff * 3)
    reportSheet.Rows(7).RowHeight = 15 + (diff * 3)
    reportSheet.Rows(8).RowHeight = 15 + (diff * 3)
    reportSheet.Rows(9).RowHeight = 15 + (diff * 3)
        
  End If
  
  projectAccomplishmentsRange.value = accString
  
  Dim reportArray As Variant
  reportArray = GenerateReportTable()
  
  For i = 1 To UBound(reportArray)
    
    If reportArray(i).isTask = False Then
      reportSheet.Range("B" & 10 + i).Font.Bold = True
      reportSheet.Range("B" & 10 + i).value = reportArray(i).name
    Else
      reportSheet.Range("B" & 10 + i).Font.Bold = False
      reportSheet.Range("B" & 10 + i).value = reportArray(i).name
      
      If workplan.workplanType = 0 Then
        reportSheet.Range("E" & 10 + i).value = ConvertWKIntoDateFirst(reportArray(i).startDate)
        reportSheet.Range("F" & 10 + i).value = ConvertWKIntoDateLast(reportArray(i).finishDate)
      Else
        reportSheet.Range("E" & 10 + i).value = reportArray(i).startDate
        reportSheet.Range("F" & 10 + i).value = reportArray(i).finishDate
      End If
      
      reportSheet.Range("G" & 10 + i).value = reportArray(i).target
      reportSheet.Range("G" & 10 + i).NumberFormat = "#,##0"
      
      reportSheet.Range("H" & 10 + i).value = reportArray(i).remaining
      reportSheet.Range("H" & 10 + i).NumberFormat = "#,##0"
      
      If reportArray(i).target > 0 Then
        reportSheet.Range("I" & 10 + i).value = Round(reportArray(i).completed / reportArray(i).target, 2)
      Else
        reportSheet.Range("I" & 10 + i).value = 0
      End If
      
      
      
      reportSheet.Range("I" & 10 + i).FormatConditions.Delete
      
      Dim progressDataBar As Databar
      
      Set progressDataBar = reportSheet.Range("I" & 10 + i).FormatConditions.AddDatabar
      progressDataBar.BarFillType = xlDataBarFillGradient
      progressDataBar.BarBorder.Type = xlDataBarBorderSolid
      
      progressDataBar.MinPoint.Modify newtype:=xlConditionValueNumber, newvalue:=0
      progressDataBar.MaxPoint.Modify newtype:=xlConditionValueNumber, newvalue:=1
      
      
      If reportArray(i).status = 1 Then
        progressDataBar.BarColor.Color = RGB(99, 195, 132)
        progressDataBar.BarBorder.Color.Color = RGB(99, 195, 132)
      ElseIf reportArray(i).status = 2 Then
        progressDataBar.BarColor.Color = RGB(255, 192, 0)
        progressDataBar.BarBorder.Color.Color = RGB(255, 182, 40)
      Else
        progressDataBar.BarColor.Color = RGB(255, 85, 90)
        progressDataBar.BarBorder.Color.Color = RGB(255, 85, 90)
      End If
    End If
    
    
  Next i
  
  Dim rowCount As Integer: rowCount = reportSheet.Cells(reportSheet.Rows.count, 2).End(xlUp).row
  
  reportSheet.Range("B3:I" & rowCount).CopyPicture xlScreen, xlPicture
  
End Sub

Private Function GenerateReportAccomplishments() As String
  Dim accString As String
  
  Dim currentDate As Long
  
  If workplan.workplanType = 0 Then
    currentDate = CLng(Split(Fiscal(Date), ":")(2))
  
  ElseIf workplan.workplanType = 1 Then
    currentDate = CLng(Date)
  End If
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      Dim tasks As Variant
      tasks = workplan.milestones(i).tasks
      
      If IsArray(tasks) Then
        
        
        ' What tasks do I want to report for accomplishments?
        ' I want exclusively those accomplishments made this week.
        
        'Currently for TST-1 [Test project 2] There are none (WK15)
        
        For j = 1 To UBound(tasks)
        
          Dim dateDifference As Integer
          
          If tasks(j).newFinishDate <> 0 And IsNumeric(tasks(j).newFinishDate) Then
            dateDifference = tasks(j).newFinishDate - currentDate
           ElseIf tasks(j).finishDate <> 0 And IsNumeric(tasks(j).finishDate) Then
            dateDifference = tasks(j).finishDate - currentDate
          Else
            dateDifference = 10000
          End If
                    
          If tasks(j).flag = 1 Then
            If workplan.workplanType = 0 Then
              If tasks(j).actualDate = currentDate Then
                accString = accString & "- [" & tasks(j).name & " ] is completed." & Chr(10)
              End If
            Else
              If Abs(tasks(j).actualDate - currentDate) < 3 Then
                accString = accString & "- [" & tasks(j).name & " ] is completed. (" & tasks(j).actualDate & ")" & Chr(10)
              End If
            End If
          ElseIf tasks(j).status = 1 And tasks(j).progress >= progressTresholdSetting And dateDifference < 2 Then
            accString = accString & "- [" & tasks(j).name & " ] is at " & Round(tasks(j).progress * 100, 0) & "% progress." & Chr(10)
          End If
          
        Next j
        
      End If
      
    Next i
  End If
  
  GenerateReportAccomplishments = accString
End Function

Private Function GenerateReportTable() As Report()
  Dim reportArray() As Report
  Dim reportCount As Integer
  
  Dim addedMilestone As Boolean: addedMilestone = False
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      addedMilestone = False
      Dim tasks As Variant
      tasks = workplan.milestones(i).tasks
      
      If workplan.milestones(i).flag = 0 Then
        reportCount = reportCount + 1
        
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).target > 0 Then
              reportCount = reportCount + 1
            End If
          Next j
        End If
      Else
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).flag = 0 Then
              reportCount = reportCount + 1
              
              If addedMilestone = False Then
                reportCount = reportCount + 1
                addedMilestone = True
              End If
            End If
          Next j
        End If
      End If
    Next i
  End If
  
  ReDim reportArray(reportCount) As Report
  
  Dim addIndex As Integer: addIndex = 1
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      addedMilestone = False
      
      tasks = workplan.milestones(i).tasks
      
      If workplan.milestones(i).flag = 0 Then
        Dim milestoneReport As Report
        Set milestoneReport = New Report
        
        milestoneReport.name = workplan.milestones(i).name
        milestoneReport.isTask = False
        tasks = workplan.milestones(i).tasks
        
        Set reportArray(addIndex) = milestoneReport
        addIndex = addIndex + 1
        
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).target > 0 Then
              Dim taskReport As Report
              Set taskReport = New Report
              
              taskReport.isTask = True
              taskReport.name = tasks(j).name
              taskReport.startDate = tasks(j).startDate
              
              If tasks(j).newFinishDate <> 0 Then
                taskReport.finishDate = tasks(j).newFinishDate
              Else
                taskReport.finishDate = tasks(j).finishDate
              End If
              
              taskReport.target = tasks(j).target
              taskReport.completed = tasks(j).completed
              taskReport.remaining = tasks(j).remaining
              
              Dim timeResult As OnTimeResult
              Set timeResult = IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate)
             
              Dim status As Integer
              
              If timeResult.weeksBehind = 0 Then
                status = 1
              ElseIf timeResult.weeksBehind <= taskBehindStatusSetting Then
                taskReport.name = taskReport.name & " (" & timeResult.weeksBehind & " weeks behind)"
                status = 2
              ElseIf timeResult.weeksBehind >= taskOutStatusSetting Then
                taskReport.name = taskReport.name & " (" & timeResult.weeksBehind & " weeks behind)"
                status = 3
              End If
              
              taskReport.status = status
              
              Set reportArray(addIndex) = taskReport
              addIndex = addIndex + 1
            End If
            
          Next j
        End If
      Else
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).flag = 0 Then
              If addedMilestone = False Then
                Set milestoneReport = New Report
                milestoneReport.name = workplan.milestones(i).name
                milestoneReport.isTask = False
                Set reportArray(addIndex) = milestoneReport
                addIndex = addIndex + 1
                addedMilestone = True
                
              End If
              
              Set taskReport = New Report
              
              taskReport.isTask = True
              taskReport.name = tasks(j).name
              taskReport.startDate = tasks(j).startDate
              
              If tasks(j).newFinishDate <> 0 Then
                taskReport.finishDate = tasks(j).newFinishDate
              Else
                taskReport.finishDate = tasks(j).finishDate
              End If
              
              taskReport.target = tasks(j).target
              taskReport.completed = tasks(j).completed
              taskReport.remaining = tasks(j).remaining
              
              Set timeResult = IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate)
              
              If timeResult.weeksBehind = 0 Then
                status = 1
              ElseIf timeResult.weeksBehind <= taskBehindStatusSetting Then
                'taskReport.name = taskReport.name & " (" & timeResult.weeksBehind & " weeks behind)"
                status = 2
              ElseIf timeResult.weeksBehind >= taskOutStatusSetting Then
                'taskReport.name = taskReport.name & " (" & timeResult.weeksBehind & " weeks behind)"
                status = 3
              End If
              
              taskReport.status = status
              
              Set reportArray(addIndex) = taskReport
              addIndex = addIndex + 1
              
            End If
          Next j
        End If
        
      End If
    Next i
  End If
  
  GenerateReportTable = reportArray
End Function

Public Sub ShowSettings()
  Dim settingsSheet As Worksheet

  Set settingsSheet = ThisWorkbook.Sheets("Settings")
  If settingsSheet.Visible = xlSheetVisible Then
    settingsSheet.Visible = xlSheetHidden
  Else
    settingsSheet.Visible = xlSheetVisible
    settingsSheet.Activate
  End If
End Sub



Private Sub Worksheet_PivotTableUpdate(ByVal target As PivotTable)
  Dim mainWorkbook As Workbook
  Set mainWorkbook = ThisWorkbook
  
  mainWorkbook.Sheets("Summary").Range("C9").value = ""
End Sub

Private Sub Worksheet_Change(ByVal target As Range)
  
  Dim message As String

  Dim keyCell As Range
  Set keyCell = Range("C9")

  If Not Application.Intersect(keyCell, Range(target.address)) Is Nothing Then
    'Set workplan As New Workplan
    
    
    CleanBlocker
    
    Application.ScreenUpdating = False
    
    Dim cellValue As String
    cellValue = ThisWorkbook.Sheets("Summary").Range("C9").value
    
    If cellValue <> "" Then
      ReadSettings
      'Get row data
      Dim projectData As Variant
      projectData = GetDataFromProjectsTable(cellValue)
      
      'Check for file path
      If projectData(7) = "" Then
        message = "No Workplan specified for project!"
        GoTo Inform
      End If
      
      Dim projectFilePath As String
      projectFilePath = projectData(7)
      
      'Test for valid path
      If Not IsValidPath(projectFilePath) Then
        message = "Specified Workplan file not found!"
        GoTo Inform
      End If
      
      'Application.DisplayAlerts = False
      Dim sourceWorkbook As Workbook
      Set sourceWorkbook = Workbooks.Open(Filename:=projectFilePath, ReadOnly:=True, UpdateLinks:=True)
      
      
      
      'Application.DisplayAlerts = True
      
      Dim projectId As String
      projectId = projectData(2)
      
      Dim workplanSheetIndex As Integer
      workplanSheetIndex = IsValidWorkplan(projectId, sourceWorkbook)
      
      
      If workplanSheetIndex = -1 Then
        message = "Specified file is not a valid Workplan!"
        Application.DisplayAlerts = False
        sourceWorkbook.Close
        Application.DisplayAlerts = True
        GoTo Inform
      End If
      
      'Debug.Print workplanSheetIndex
      
      
      Dim workplanSheet As Worksheet
      Set workplanSheet = sourceWorkbook.Sheets(workplanSheetIndex)
      
      Dim workplanVersion As String
      workplanVersion = IsValidVersion(workplanSheet)
      
      If workplanVersion = "unknown" Then
        message = "Unknown Workplan version!"
        Application.DisplayAlerts = False
        sourceWorkbook.Close
        Application.DisplayAlerts = True
        GoTo Inform
      End If
      
      Dim workplanType As Integer
      workplanType = DetermineWorkplanType(workplanVersion, workplanSheet)
      

      
      
      workplan.workplanType = workplanType
      
      Dim bridge As DataBridge
      
      Set bridge = CreateBridgeByVersion(workplanVersion, workplanSheet)
      
   
      
      'Debug.Print bridge.toString
      
      GetProjectData workplanVersion, workplanSheet, bridge
      
  
      
      workplan.milestones = GetMilestoneData(workplanVersion, workplanSheet, bridge)
      
     
      
      CalculateProjectStatus workplan
      
      Dim accString As String
      accString = GenerateAccomplishmentsString(workplan)
      
      Dim risksString As String
      risksString = GenerateRisksString(workplan)
      
      Dim remarksString As String
      remarksString = GenerateRemarksString(workplan)

      Dim onHoldString As String
      onHoldString = GenerateOnHoldString(workplan)
            
      Dim reportArray As Variant
      reportArray = GenerateReportArray(workplan)
      
            
  
      FillBlocker accString, risksString, remarksString, onHoldString, reportArray, workplan
      FillInWorkReport workplan

    End If
    
    If Not sourceWorkbook Is Nothing Then
      Application.DisplayAlerts = False
      sourceWorkbook.Close
      Application.DisplayAlerts = True
    End If
    
    
    Application.ScreenUpdating = True
  End If
  
Exit Sub

Inform:
  MsgBox message
End Sub

Private Sub ReadSettings()
  'Read settings from the "Settings" Sheet and put them in a series of global variables :D
  Dim reportingWeeksRange As Range: Set reportingWeeksRange = ThisWorkbook.Sheets("Settings").Range("C7")
  Dim progressTresholdRange As Range: Set progressTresholdRange = ThisWorkbook.Sheets("Settings").Range("F7")
  Dim tasksBehindCountRange As Range: Set tasksBehindCountRange = ThisWorkbook.Sheets("Settings").Range("C10")
  Dim tasksLateCountRange As Range: Set tasksLateCountRange = ThisWorkbook.Sheets("Settings").Range("F10")
  Dim separateRRRange As Range: Set separateRRRange = ThisWorkbook.Sheets("Settings").Range("C13")
  Dim reportingFileRange As Range: Set reportingFileRange = ThisWorkbook.Sheets("Settings").Range("C21")
  Dim showErrorMessagesRange As Range: Set showErrorMessagesRange = ThisWorkbook.Sheets("Settings").Range("C26")
  Dim taskBehindStatusRange As Range: Set taskBehindStatusRange = ThisWorkbook.Sheets("Settings").Range("F13")
  Dim taskOutStatusRange As Range: Set taskOutStatusRange = ThisWorkbook.Sheets("Settings").Range("C16")
  
  reportingWeeksSetting = CInt(reportingWeeksRange.value)
  progressTresholdSetting = CDbl(progressTresholdRange.value)
  tasksBehindCountSetting = CInt(tasksBehindCountRange.value)
  tasksLateCountSetting = CInt(tasksLateCountRange.value)
  separateRemarksRisksSetting = CBool(separateRRRange.value)
  reportingFilePathSetting = reportingFileRange.value
  showErrorMessagesSetting = CBool(showErrorMessagesRange.value)
  taskBehindStatusSetting = CInt(taskBehindStatusRange.value)
  taskOutStatusSetting = CInt(taskOutStatusRange.value)
  
  'Dim taskBehindStatusSetting As Integer
' Dim taskOutStatusSetting As Integer
End Sub


Private Sub CleanBlocker()
  Dim blockerTitleRange As Range
  Dim blockerStatusRange As Range
  Dim blockerProgressRange As Range
  Dim blockerAccomplishmentsRange As Range
  Dim blockerRisksRange As Range
  Dim blockerRemarksRange As Range
  Dim blockerOnHoldRange As Range
  
  Dim blockerReportRange As Range
  
  Set blockerTitleRange = ThisWorkbook.Sheets("Summary").Range("B12")
  Set blockerStatusRange = ThisWorkbook.Sheets("Summary").Range("C13")
  Set blockerProgressRange = ThisWorkbook.Sheets("Summary").Range("H13")
  Set blockerAccomplishmentsRange = ThisWorkbook.Sheets("Summary").Range("B15")
  Set blockerRisksRange = ThisWorkbook.Sheets("Summary").Range("E15")
  Set blockerRemarksRange = ThisWorkbook.Sheets("Summary").Range("B20")
  Set blockerOnHoldRange = ThisWorkbook.Sheets("Summary").Range("E20")
  Set blockerReportRange = ThisWorkbook.Sheets("Summary").Range("B27:G130")
  
  
  blockerTitleRange.value = ""
  blockerStatusRange.value = ""
  blockerProgressRange.value = ""
  blockerAccomplishmentsRange.value = ""
  blockerRisksRange.value = ""
  blockerRemarksRange.value = ""
  blockerOnHoldRange.value = ""
  
  blockerReportRange.value = ""
  ThisWorkbook.Sheets("Summary").Range("B27:I200").value = ""
  ThisWorkbook.Sheets("Summary").Range("B27:I200").Interior.Color = RGB(255, 255, 255)
  ThisWorkbook.Sheets("Summary").Range("B25").value = ""
  
  Dim thisWorksheet As Worksheet
  Set thisWorksheet = ThisWorkbook.Sheets("Summary")
  
  thisWorksheet.Range("L25").value = ""
  thisWorksheet.Range("L27:Q200").Interior.Color = RGB(255, 255, 255)
  thisWorksheet.Range("L27:Q200").value = ""

  Set workplan = Nothing
  
  
End Sub

Private Function GetDataFromProjectsTable(projectName As String) As String()
 
  projectName = LCase(Trim(projectName))

  Dim mainWorksheet As Worksheet
  Set mainWorksheet = ThisWorkbook.Sheets("Project List")

  Dim projectsTable As ListObject
  Set projectsTable = mainWorksheet.ListObjects("Projects")
  
  Dim currentProjectName As String
  
  Dim projectData(7) As String
  
  For i = 1 To projectsTable.ListRows.count
    currentProjectName = LCase(Trim(projectsTable.ListRows(i).Range(4).value))
    If currentProjectName = projectName Then
      'Debug.Print "ashoa"
      projectData(1) = projectsTable.ListRows(i).Range(2).value ' Number
      projectData(2) = projectsTable.ListRows(i).Range(3).value ' ID
    
      
      projectData(3) = projectsTable.ListRows(i).Range(4).value ' Project name
      projectData(4) = projectsTable.ListRows(i).Range(5).value ' Manager
      projectData(5) = projectsTable.ListRows(i).Range(7).value ' Progress
      projectData(6) = projectsTable.ListRows(i).Range(8).value ' PMO
      
      projectData(7) = projectsTable.ListRows(i).Range(1)
      
      Exit For
    End If
    
  Next i

  GetDataFromProjectsTable = projectData
End Function

Private Function IsValidPath(filePath As String) As Boolean
  
  If InStr(1, filePath, "file://") = 1 Then
    filePath = Mid(filePath, 8)
  End If
  
  Dim exists As Boolean
  exists = URLExists(filePath)

  IsValidPath = exists
  Exit Function
EndFunction:
End Function

'Returns the index of a valid workplan sheet or -1 if none are valid
Private Function IsValidWorkplan(projectId As String, wp As Workbook) As Integer
  
  'Should use ID to check if workplan corresponds to selected workplan
  
  Dim currentSheet As Worksheet
  
  Dim workplanScore As Integer
  workplanScore = -1
  
  Dim hasValidId As Boolean
  hasValidId = False
  
  For sindex = 1 To wp.Sheets.count
  
  
    Set currentSheet = wp.Sheets(sindex)
    workplanScore = 0
    
    Dim valuesArray() As Variant
    valuesArray = currentSheet.Range("A1:V10").value
    
    'Debug.Print currentSheet.name
    
    For i = LBound(valuesArray, 1) To UBound(valuesArray, 1)
      For j = LBound(valuesArray, 2) To UBound(valuesArray, 2)
        If valuesArray(i, j) <> "" Then
          Dim value As String
          value = LCase(valuesArray(i, j))
          
          If value = "workplan" Then
            workplanScore = workplanScore + 1
          ElseIf value = "project id" Then
            workplanScore = workplanScore + 1
          ElseIf value = "project name" Then
            workplanScore = workplanScore + 1
          ElseIf value = "project objective" Then
            workplanScore = workplanScore + 1
          ElseIf value = "task" Then
            workplanScore = workplanScore + 1
          ElseIf value = "responsible" Then
            workplanScore = workplanScore + 1
          ElseIf value = "status" Then
            workplanScore = workplanScore + 1
          ElseIf value = "progress" Then
            workplanScore = workplanScore + 1
          End If
          
          If value = "project id" Then
            'Debug.Print valuesArray(i + 1, j)
            
            If valuesArray(i + 1, j) = projectId Then
              hasValidId = True
            End If
          End If
          
        End If
      Next j
    Next i
    
    'Debug.Print workplanScore, hasValidId
    
      
    If workplanScore >= 8 And hasValidId Then
      'Debug.Print "index", sindex
      IsValidWorkplan = sindex
      Exit Function
    End If
    
  Next sindex
  
  IsValidWorkplan = -1
  
End Function

'Returns the version of a specific Workplan and "unknown" if it's not valid.
Private Function IsValidVersion(sourceWorksheet As Worksheet) As String

  Dim valuesArray() As Variant
  valuesArray = sourceWorksheet.Range("A1:V10").value
  Dim workplanVersion As String
  workplanVersion = "unknown"
  
  Dim v3Fields(1 To 24, 1 To 2) As String
  v3Fields(1, 1) = "project id"
  v3Fields(2, 1) = "project name"
  v3Fields(3, 1) = "project objective"
  v3Fields(4, 1) = "project owner"
  v3Fields(5, 1) = "project start date"
  v3Fields(6, 1) = "remarks"
  v3Fields(7, 1) = "total progress"
  v3Fields(8, 1) = "flags"
  v3Fields(9, 1) = "#"
  v3Fields(10, 1) = "task"
  v3Fields(11, 1) = "responsible"
  v3Fields(12, 1) = "status"
  v3Fields(13, 1) = "progress"
  v3Fields(14, 1) = "task duration" ' Test with inStr for partial matching
  v3Fields(15, 1) = "start date week"
  v3Fields(16, 1) = "finish date week"
  v3Fields(17, 1) = "new finish date"
  v3Fields(18, 1) = "actual date"
  v3Fields(19, 1) = "task predecessor"
  v3Fields(20, 1) = "completed (if applicable)"
  v3Fields(21, 1) = "target (if applicable)"
  v3Fields(22, 1) = "remaining (if applicable)"
  v3Fields(23, 1) = "remarks"
  v3Fields(24, 1) = "comments"
  
  v3Fields(1, 2) = False
  v3Fields(2, 2) = False
  v3Fields(3, 2) = False
  v3Fields(4, 2) = False
  v3Fields(5, 2) = False
  v3Fields(6, 2) = False
  v3Fields(7, 2) = False
  v3Fields(8, 2) = False
  v3Fields(9, 2) = False
  v3Fields(10, 2) = False
  v3Fields(11, 2) = False
  v3Fields(12, 2) = False
  v3Fields(13, 2) = False
  v3Fields(14, 2) = False
  v3Fields(15, 2) = False
  v3Fields(16, 2) = False
  v3Fields(17, 2) = False
  v3Fields(18, 2) = False
  v3Fields(19, 2) = False
  v3Fields(20, 2) = False
  v3Fields(21, 2) = False
  v3Fields(22, 2) = False
  v3Fields(23, 2) = False
  v3Fields(24, 2) = False
  
  'Dim scrumV1Fields() As String
  
  
    For i = LBound(valuesArray, 1) To UBound(valuesArray, 1)
      For j = LBound(valuesArray, 2) To UBound(valuesArray, 2)
        If valuesArray(i, j) <> "" Then
          Dim value As String
          value = LCase(Trim(valuesArray(i, j)))
          
          For k = LBound(v3Fields, 1) To UBound(v3Fields, 1)
            Dim currentTestField As String
            currentTestField = v3Fields(k, 1)
            
            'Debug.Print currentTestField & " - " & value
            
            If currentTestField = value Then
              v3Fields(k, 2) = True
              
            ElseIf currentTestField = "task duration" Then
              If InStr(1, value, currentTestField) = 1 Then
                v3Fields(k, 2) = True
              End If
            End If
          Next k
          
        End If
      Next j
    Next i
    
  Dim validV3 As Boolean
  validV3 = True
  
  For i = 1 To UBound(v3Fields, 1)
    If v3Fields(i, 2) = False Then

      validV3 = False
      'Exit For
    End If
    
    
    'Debug.Print v3Fields(i, 1) & " -> " & v3Fields(i, 2)
  Next i
  
  If validV3 Then
    workplanVersion = "v3"
  End If
  
  IsValidVersion = workplanVersion
End Function


Private Function TestVersion() As Boolean

End Function

Private Function DetermineWorkplanType(version As String, workplanSheet As Worksheet) As Integer
  Dim workplanType As Integer
  workplanType = -1

  If version = "v3" Then
    Dim valuesArray() As Variant
    valuesArray = workplanSheet.Range("A1:V10").value
    
    For i = LBound(valuesArray, 1) To UBound(valuesArray, 1)
      For j = LBound(valuesArray, 2) To UBound(valuesArray, 2)
        If valuesArray(i, j) <> "" Then
          Dim value As String
          value = LCase(Trim(valuesArray(i, j)))
          
          If InStr(1, value, "task duration") = 1 Then
            If InStr(1, value, "weeks") <> 0 Then
              workplanType = 0
            ElseIf InStr(1, value, "days") <> 0 Then
              workplanType = 1
            Else
              workplanType = -1
            End If
          End If
          
          'Debug.Print value
        End If
      Next j
    Next i
  End If
  
  DetermineWorkplanType = workplanType
  
End Function

Private Function CreateBridgeByVersion(version As String, sourceWorksheet As Worksheet) As DataBridge
  'Debug.Print version
  'Debug.Print sourceWorksheet.name

  If version = "v3" Then

    Dim v3Fields(1 To 23, 1 To 2) As String

    v3Fields(1, 1) = "project id"
    v3Fields(2, 1) = "project name"
    v3Fields(3, 1) = "project objective"
    v3Fields(4, 1) = "project owner"
    v3Fields(5, 1) = "project start date"
    v3Fields(6, 1) = "project remarks"
    v3Fields(7, 1) = "total progress"
    v3Fields(8, 1) = "flags"
    v3Fields(9, 1) = "#"
    v3Fields(10, 1) = "task"
    v3Fields(11, 1) = "responsible"
    v3Fields(12, 1) = "status"
    v3Fields(13, 1) = "progress"
    v3Fields(14, 1) = "task duration"
    v3Fields(15, 1) = "start date week"
    v3Fields(16, 1) = "finish date week"
    v3Fields(17, 1) = "new finish date"
    v3Fields(18, 1) = "actual date"
    v3Fields(19, 1) = "completed (if applicable)"
    v3Fields(20, 1) = "target (if applicable)"
    v3Fields(21, 1) = "remaining (if applicable)"
    v3Fields(22, 1) = "remarks"
    v3Fields(23, 1) = "comments"
    

    Dim valuesArray() As Variant
    valuesArray = sourceWorksheet.Range("A1:V10").value

    For i = LBound(valuesArray, 1) To UBound(valuesArray, 1)
        For j = LBound(valuesArray, 2) To UBound(valuesArray, 2)
          If valuesArray(i, j) <> "" Then
            Dim value As String
            value = LCase(Trim(valuesArray(i, j)))

            For k = LBound(v3Fields, 1) To UBound(v3Fields, 1)
              Dim currentTestField As String
              currentTestField = v3Fields(k, 1)

              'Estamos iterando sobre todas las celdas del archivo de la A1 a la S10 (value)
              'Estamos a su vez iterando sobre todos los valores del arreglo (currentTestField)
              'Lo que queremos es popular el arreglo de valores en su segunda celda con las direcciones de esta cosa.
              'Si son direcciones de columna, es decir, que crecen hacia abajo simplemente necesitamos poner la direccion del campo + 1 hacia abajo
              'Si son direcciones fila, necesitamos poner la direccion del campo + 1 hacia la derecha
              
              'Caso especial: Remarks. Hay dos, uno de proyecto y otro de tarea. El de proyecto viene primero
              
              If currentTestField = "project remarks" And value = "remarks" Then
                If v3Fields(6, 2) = "" Then
                  v3Fields(6, 2) = sourceWorksheet.Range("A1:V10").Item(i + 1, j).address
                End If
              'ElseIf currentTestField = "remarks" And value = "remarks" And v3Fields(6, 2) <> "" Then
               ' If v3Fields(22, 2) = "" Then
                '  v3Fields(22, 2) = sourceWorksheet.Range("A1:S10").Item(i + 1, j).address
                'End If
              Else
              
                If currentTestField = value Then
                  If currentTestField = "total progress" Then
                    v3Fields(k, 2) = sourceWorksheet.Range("A1:V10").Item(i, j + 1).address
                  Else
                    v3Fields(k, 2) = sourceWorksheet.Range("A1:V10").Item(i + 1, j).address
                  End If
                  
                  
                ElseIf currentTestField = "task duration" Then
                  'Task duration is a column value
                  If InStr(1, value, currentTestField) = 1 Then
                    v3Fields(k, 2) = sourceWorksheet.Range("A1:V10").Item(i + 1, j).address
                  End If
                End If
              
              End If

              'If currentTestField = value Then

               ' v3Fields(k, 2) = sourceWorksheet.Range("A1:S10").Item(i, j).address

             ' ElseIf currentTestField = "task duration" Then
              '  If InStr(1, value, currentTestField) = 1 Then
               '   v3Fields(k, 2) = sourceWorksheet.Range("A1:S10").Item(i, j).address
                'End If
              'End If
            Next k

          End If
        Next j
     Next i

    For i = 1 To UBound(v3Fields, 1)
      'Debug.Print v3Fields(i, 1) & " - " & v3Fields(i, 2)
    Next i

    Dim bridge As DataBridge
    Set bridge = New DataBridge

    bridge.projectIDRange = v3Fields(1, 2)
    bridge.projectNameRange = v3Fields(2, 2)
    bridge.projectObjectiveRange = v3Fields(3, 2)
    bridge.projectOwnerRange = v3Fields(4, 2)
    bridge.projectSDRange = v3Fields(5, 2)
    bridge.projectRemarksRange = v3Fields(6, 2)
    bridge.projectProgressRange = v3Fields(7, 2)
    bridge.flagRange = v3Fields(8, 2)
    bridge.numberRange = v3Fields(9, 2)
    bridge.nameRange = v3Fields(10, 2)
    bridge.responsibleRange = v3Fields(11, 2)
    bridge.statusRange = v3Fields(12, 2)
    bridge.progressRange = v3Fields(13, 2)
    bridge.durationRange = v3Fields(14, 2)
    bridge.startDateRange = v3Fields(15, 2)
    bridge.finishDateRange = v3Fields(16, 2)
    bridge.newFinishDateRange = v3Fields(17, 2)
    bridge.actualDateRange = v3Fields(18, 2)
    bridge.completedRange = v3Fields(19, 2)
    bridge.targetRange = v3Fields(20, 2)
    bridge.remainingRange = v3Fields(21, 2)
    bridge.remarksRange = v3Fields(22, 2)
    bridge.commentsRange = v3Fields(23, 2)

    'bridge.projectIDRange = v3Fields(1, 2)
    'bridge.projectNameRange = v3Fields(2, 2)
    'bridge.projectObjectiveRange = v3Fields(3, 2)
    'bridge.projectOwnerRange = v3Fields(4, 2)
    'bridge.projectSDRange = v3Fields(5, 2)
    'bridge.projectRemarksRange = v3Fields(6, 2)
    'bridge.projectProgressRange = v3Fields(7, 2)
    'bridge.milestoneNameRange = v3Fields(8, 2)
    'bridge.milestoneFlagRange = v3Fields(9, 2)
    'bridge.taskNumberRange = v3Fields(10, 2)
    
    

    Set CreateBridgeByVersion = bridge

  End If

End Function

Private Function GetProjectData(version As String, workplanSheet As Worksheet, DataBridge As DataBridge)
    
  
    workplan.projectId = workplanSheet.Range(GetAddressForKey("projectIDRange", version, DataBridge)).value
    workplan.projectName = workplanSheet.Range(GetAddressForKey("projectNameRange", version, DataBridge)).value
    workplan.projectObjective = workplanSheet.Range(GetAddressForKey("projectObjectiveRange", version, DataBridge)).value
    workplan.projectOwner = workplanSheet.Range(GetAddressForKey("projectOwnerRange", version, DataBridge)).value
    
    workplan.projectStartDate = workplanSheet.Range(GetAddressForKey("projectSDRange", version, DataBridge)).value
  
    workplan.projectRemarks = workplanSheet.Range(GetAddressForKey("projectRemarksRange", version, DataBridge)).value
    workplan.projectProgress = workplanSheet.Range(GetAddressForKey("projectProgressRange", version, DataBridge)).value
    workplan.projectStatus = -1
    
  'Debug.Print workplan.toString
End Function

Private Function GetMilestoneData(version As String, workplanSheet As Worksheet, bridge As DataBridge) As Milestone()

  Dim dataRange As Range
  Set dataRange = workplanSheet.UsedRange
  
  Dim columnCount As Integer
  columnCount = dataRange.Columns.count
  
  Dim rowCount As Integer
  rowCount = workplanSheet.Cells(workplanSheet.Rows.count, 3).End(xlUp).row

  Dim startRow As Integer
  startRow = workplanSheet.Cells(1, 1).End(xlDown).row + 1
  
  If version = "v3" Then
    Dim milestones() As Milestone
    
    Dim milestoneCount As Integer
    milestoneCount = 0
    
    Dim i As Integer
    
    
    For i = startRow To rowCount
      If workplanSheet.Range("C" & i).Interior.Color = 14998742 Then
        milestoneCount = milestoneCount + 1
      End If
    Next i
    
    ReDim milestones(milestoneCount) As Milestone
    
    Dim j As Integer
    j = 1
    
    Dim nameColumn As String
    nameColumn = Split(GetAddressForKey("nameRange", version, bridge), "$")(1)
      
    Dim flagColumn As String
    flagColumn = Split(GetAddressForKey("flagRange", version, bridge), "$")(1)
      
    Dim remarksColumn As String
    remarksColumn = Split(GetAddressForKey("remarksRange", version, bridge), "$")(1)
    
    For i = startRow To rowCount
      If workplanSheet.Range("C" & i).Interior.Color = 14998742 Then
        Dim Milestone As Milestone
        Set Milestone = New Milestone
        

        Milestone.name = workplanSheet.Range(nameColumn & i).value

        Milestone.flag = getFlagInt(workplanSheet.Range(flagColumn & i).value)
        Milestone.status = -1
        Milestone.progress = 0
        Milestone.row = i
        
        Milestone.remarks = workplanSheet.Range(remarksColumn & i).value
        
        Milestone.tasks = GetTaskData(version, Milestone.row, workplanSheet, bridge)
        
        CalculateMilestoneStatus Milestone
        CalculateMilestoneProgress Milestone
        CalculateMilestoneDates Milestone
        
        Set milestones(j) = Milestone
        j = j + 1
        
        
      End If
    Next i
    
    
    
    GetMilestoneData = milestones
    
    'Debug.Print workplan.toString
  
    'Get task for data
  End If
End Function

Private Function GetTaskData(version As String, startRow As Integer, workplanSheet As Worksheet, bridge As DataBridge) As task()
  If version = "v3" Then
    Dim i As Integer
    i = 1
    
    Dim taskCount As Integer
    
    'Bridge
    While (workplanSheet.Range("C" & startRow + i).Interior.Color = 16777215 And workplanSheet.Range("C" & startRow + i).value <> "")
      taskCount = taskCount + 1
      i = i + 1
    Wend
    
    Dim tasks As Variant
    ReDim tasks(taskCount) As task
    
    Dim j As Integer
    j = 1
    
     
    Dim numberColumn As String: numberColumn = Split(GetAddressForKey("numberRange", version, bridge), "$")(1)
    Dim nameColumn As String: nameColumn = Split(GetAddressForKey("nameRange", version, bridge), "$")(1)
    Dim responsibleColumn As String: responsibleColumn = Split(GetAddressForKey("responsibleRange", version, bridge), "$")(1)
    Dim flagColumn As String: flagColumn = Split(GetAddressForKey("flagRange", version, bridge), "$")(1)
    Dim statusColumn As String: statusColumn = Split(GetAddressForKey("statusRange", version, bridge), "$")(1)
    Dim progressColumn As String: progressColumn = Split(GetAddressForKey("progressRange", version, bridge), "$")(1)
    Dim durationColumn As String: durationColumn = Split(GetAddressForKey("durationRange", version, bridge), "$")(1)
    
    
    Dim SDColumn As String: SDColumn = Split(GetAddressForKey("startDateRange", version, bridge), "$")(1)
    Dim FDColumn As String: FDColumn = Split(GetAddressForKey("finishDateRange", version, bridge), "$")(1)
    Dim NFDColumn As String: NFDColumn = Split(GetAddressForKey("newFinishDateRange", version, bridge), "$")(1)
    Dim ADColumn As String: ADColumn = Split(GetAddressForKey("actualDateRange", version, bridge), "$")(1)

    Dim completedColumn As String: completedColumn = Split(GetAddressForKey("completedRange", version, bridge), "$")(1)
    Dim targetColumn As String: targetColumn = Split(GetAddressForKey("targetRange", version, bridge), "$")(1)
    Dim remainingColumn As String: remainingColumn = Split(GetAddressForKey("remainingRange", version, bridge), "$")(1)
  
    Dim remarksColumn As String: remarksColumn = Split(GetAddressForKey("remarksRange", version, bridge), "$")(1)
    Dim commentsColumn As String: commentsColumn = Split(GetAddressForKey("commentsRange", version, bridge), "$")(1)
    
    'Debug.Print numberColumn
    'Debug.Print nameColumn
    'Debug.Print responsibleColumn
    'Debug.Print flagColumn
    'Debug.Print statusColumn
    'Debug.Print progressColumn
    'Debug.Print durationColumn
    
    'Debug.Print SDColumn
    'Debug.Print FDColumn
    'Debug.Print NFDColumn
    'Debug.Print ADColumn
    
    'Debug.Print remarksColumn
    'Debug.Print commentsColumn
    
    For i = startRow + 1 To startRow + taskCount
      Dim task As task
      
      Set task = New task
      
      'Bridge
      task.name = Replace(workplanSheet.Range(numberColumn & i).value & ". " & workplanSheet.Range(nameColumn & i).value, Chr(10), " ")
      task.responsible = workplanSheet.Range(responsibleColumn & i).value
      'Debug.Print getFlagInt(workplanSheet.Range(flagColumn & i).value)
      task.flag = getFlagInt(workplanSheet.Range(flagColumn & i).value)
      task.status = getStatusInt(workplanSheet.Range(statusColumn & i).value)
      
      If IsNumeric(workplanSheet.Range(progressColumn & i).value) Then
        task.progress = workplanSheet.Range(progressColumn & i).value
      Else
        task.progress = 0
      End If
      
      
      
      If IsNumeric(workplanSheet.Range(durationColumn & i).value) Then
        If workplanSheet.Range(durationColumn & i).value > 0 Then
          task.duration = workplanSheet.Range(durationColumn & i).value
        Else
          task.duration = -1
        End If
        
      Else
        task.duration = -1
      End If
      
      'Bridge
      If IsNumeric(workplanSheet.Range(SDColumn & i).value) Then
        task.startDate = workplanSheet.Range(SDColumn & i).value
      End If
      
      'Bridge
      If IsNumeric(workplanSheet.Range(FDColumn & i).value) Then
        task.finishDate = workplanSheet.Range(FDColumn & i).value
      End If
      
      'Bridge
      If IsNumeric(workplanSheet.Range(NFDColumn & i).value) Then
        task.newFinishDate = workplanSheet.Range(NFDColumn & i).value
      End If
      
      'Bridge
      If IsNumeric(workplanSheet.Range(ADColumn & i).value) Then
        task.actualDate = workplanSheet.Range(ADColumn & i).value
      End If
      
      'Bridge
      
      If IsNumeric(workplanSheet.Range(completedColumn & i).value) Then
        task.completed = workplanSheet.Range(completedColumn & i).value
      Else
        task.completed = 0
      End If
      
      
     ' Debug.Print completedColumn, i
      
      If IsNumeric(workplanSheet.Range(targetColumn & i).value) Then
        task.target = workplanSheet.Range(targetColumn & i).value
      Else
        task.target = 0
      End If
      
      If IsNumeric(workplanSheet.Range(remainingColumn & i).value) Then
        task.remaining = workplanSheet.Range(remainingColumn & i).value
      Else
        task.remaining = 0
      End If

      
      
      'Bridge
      task.remarks = workplanSheet.Range(remarksColumn & i).value
      task.comments = workplanSheet.Range(commentsColumn & i).value
      
      Set tasks(j) = task
      
      j = j + 1
      
    Next i
    
    GetTaskData = tasks
    
  End If
  
  
  
End Function

Private Sub CalculateMilestoneStatus(Milestone As Milestone)
  Dim notStarted As Integer
  Dim inWork As Integer
  Dim completed As Integer
  Dim onHold As Integer
  Dim cancelled As Integer

  If IsArray(Milestone.tasks) Then
    Dim i As Integer
    
    For i = 1 To UBound(Milestone.tasks)
      If Milestone.tasks(i).status = 0 Then
        notStarted = notStarted + 1
      ElseIf Milestone.tasks(i).status = 1 Then
        inWork = inWork + 1
      ElseIf Milestone.tasks(i).status = 2 Then
        completed = completed + 1
      ElseIf Milestone.tasks(i).status = 3 Then
        onHold = onHold + 1
      ElseIf Milestone.tasks(i).status = 4 Then
        cancelled = cancelled + 1
      End If
    Next i
  Else
    Milestone.status = 0
  End If
  
  Dim status As Integer
  status = 0
  
  If inWork > 0 Then
    status = 1
  End If
  
  If onHold > 2 Then
    status = 3
  End If
  
  If completed = UBound(Milestone.tasks) Then
    status = 2
  End If
  
  If cancelled = UBound(Milestone.tasks) Then
    status = 4
  End If
  
  Milestone.status = status
  
 Dim tasksLate As Integer: tasksLate = 0

  If IsArray(Milestone.tasks) Then
    For i = 1 To UBound(Milestone.tasks)
      Dim task As task
      Set task = Milestone.tasks(i)
      If task.status <> 2 And task.status <> 4 And Not IsOnTime(task.duration, task.progress, task.startDate).onTime Then
        tasksLate = tasksLate + 1
      End If
    Next i
  End If
  

  If tasksLate < 2 Then
    Milestone.workStatus = 1
  ElseIf tasksLate > 2 And tasksLate < 4 Then
    Milestone.workStatus = 2
  ElseIf tasksLate >= 4 Then
    Milestone.workStatus = 3
  End If
  
End Sub

Private Sub CalculateMilestoneProgress(Milestone As Milestone)
  
  Dim totalProgress As Double
  
  If IsArray(Milestone.tasks) Then
    For i = 1 To UBound(Milestone.tasks)
      totalProgress = totalProgress + Milestone.tasks(i).progress
    Next i
    
    If UBound(Milestone.tasks) > 0 Then
      Milestone.progress = totalProgress / UBound(Milestone.tasks)
    Else
      Milestone.progress = 0
    End If
  Else
    Milestone.progress = 0
  End If

End Sub

Private Sub CalculateMilestoneDates(Milestone As Milestone)
Dim startDate As Date
  Dim finishDate As Date
  
  If workplan.workplanType = 0 Then
  
    If IsArray(Milestone.tasks) Then
  
      Dim lowestDate As Variant
      Dim highestDate As Variant
  
      lowestDate = 1000
      highestDate = 0
  
      For i = 1 To UBound(Milestone.tasks)
        If Milestone.tasks(i).startDate < lowestDate Then
          lowestDate = Milestone.tasks(i).startDate
        End If
        
        If Milestone.tasks(i).finishDate > highestDate Then
          highestDate = Milestone.tasks(i).finishDate
        End If
        
        If Milestone.tasks(i).newFinishDate > highestDate Then
          highestDate = Milestone.tasks(i).newFinishDate
        End If
        
      Next i
      
      
      
      'Debug.Print ConvertWKIntoDateFirst(lowestDate), ConvertWKIntoDateLast(highestDate), Milestone.name
      
      
      Milestone.startDate = ConvertWKIntoDateFirst(CInt(lowestDate))
      Milestone.finishDate = ConvertWKIntoDateLast(CInt(highestDate))
      
    End If
  ElseIf workplan.workplanType = 1 Then
    lowestDate = DateSerial(2100, 12, 30)
    highestDate = DateSerial(1900, 1, 1)
    
    
    For i = 1 To UBound(Milestone.tasks)
      If Milestone.tasks(i).startDate < lowestDate Then
        lowestDate = Milestone.tasks(i).startDate
      End If
      
      If Milestone.tasks(i).finishDate > highestDate Then
        highestDate = Milestone.tasks(i).finishDate
      End If
        
      If Milestone.tasks(i).newFinishDate > highestDate Then
        highestDate = Milestone.tasks(i).newFinishDate
      End If
    Next i
    
    Milestone.startDate = lowestDate
    Milestone.finishDate = highestDate
  End If
End Sub

Private Sub CalculateProjectStatus(workplan As workplan)
  Dim onTime As Integer
  Dim delayed As Integer
  Dim late As Integer
  
  Dim currentDate As Long
  
  If workplan.workplanType = 0 Then
    currentDate = CLng(Split(Fiscal(Date), ":")(2))
  
  ElseIf workplan.workplanType = 1 Then
    currentDate = CLng(Date)
  End If
  
  
  'currentWeek = CInt(Split(Fiscal(Date), ":")(2))
  
  Dim dateDifference As Integer
  dateDifference = 0

  If IsArray(workplan.milestones) Then
    Dim i As Integer
    
    Dim tasks As Variant
    
    Dim taskCount As Integer
    
    For i = 1 To UBound(workplan.milestones)
    
      tasks = workplan.milestones(i).tasks
        
    
      If IsArray(tasks) Then
        For j = 1 To UBound(tasks)
          If tasks(j).newFinishDate <> 0 And IsNumeric(tasks(j).newFinishDate) Then
            dateDifference = tasks(j).newFinishDate - currentDate
          ElseIf tasks(j).finishDate <> 0 And IsNumeric(tasks(j).finishDate) Then
            dateDifference = tasks(j).finishDate - currentDate
          Else
            dateDifference = 1000
          End If

          If tasks(j).status <> 2 And dateDifference < 0 Then
            'Late is just if a task is other that completed and its due date has already been surpased
            late = late + 1
            'Debug.Print tasks(j).name
          ElseIf tasks(j).status <> 2 And tasks(j).status <> 4 And Not IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate).onTime Then
            delayed = delayed + 1
          End If
          taskCount = taskCount + 1
        Next j
      End If
    Next i
  Else
    workplan.projectStatus = 0
  End If
  
  Dim status As Integer
  status = 0
  
  onTime = taskCount - late - delayed
  
  'Debug.Print late, "lated"
  'Debug.Print delayed, "delayed"
  'Debug.Print onTime, "on time"
  
  'Use settings for this
  If delayed >= tasksBehindCountSetting Then
    status = 2
  ElseIf late >= tasksLateCountSetting Then
    status = 3
  Else
    status = 1
  End If
  
  
  'Dim times(3) As Integer
  'times(1) = late
  'times(2) = delayed
  'times(3) = onTime
  
  'Dim max As Integer
  'max = -1
  
  'Dim maxIndex As Integer
  'maxIndex = -1
  
  'For i = 1 To UBound(times)
  '  Dim current As Integer
  '
  '  current = times(i)
  '
  '  If current > max Then
  '    max = current
  '    maxIndex = i
  '  End If
  'Next i
  
  'If maxIndex = 1 Then
  '  status = 3
  'ElseIf maxIndex = 2 Then
  '  status = 2
  'ElseIf maxIndex = 3 Then
  '  status = 1
  'End If
  
  'Debug.Print maxIndex
  'MsgBox "Calculate"
  workplan.projectStatus = status
  
End Sub

Private Function GenerateAccomplishmentsString(workplan As workplan) As String
  Dim accString As String
  accString = ""
  
  Dim currentWeek As Integer
  currentWeek = CInt(Split(Fiscal(Date), ":")(2))
  
  Dim currentDate As Long
  
  If workplan.workplanType = 0 Then
    currentDate = CLng(Split(Fiscal(Date), ":")(2))
  ElseIf workplan.workplanType = 1 Then
    currentDate = CLng(Date)
  End If
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      
      If workplan.milestones(i).flag = 1 Then
        'Check in "Database"
        accString = accString & "- [" & workplan.milestones(i).name & "] is completed." & "(WK" & currentDate & ")" & Chr(10)
      Else
        Dim tasks As Variant
        tasks = workplan.milestones(i).tasks
        
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            
            Dim dateDifference As Integer
            
            If IsNumeric(tasks(j).newFinishDate) And tasks(j).newFinishDate <> 0 Then
              dateDifference = tasks(j).newFinishDate - currentDate
            ElseIf IsNumeric(tasks(j).finishDate) And IsNumeric(tasks(j).finishDate) Then
              dateDifference = tasks(j).finishDate - currentDate
            Else
              dateDifference = 10000
            End If
            
            Dim dbResult As DBEntry
            Set dbResult = SearchInDB(tasks(j).name, workplan)
            
            ' The activity was not found
            If dbResult.name = "11010011" Then
              Dim shouldAdd As Boolean: shouldAdd = False
              
              'Lets skip the addition part for a moment
              
              If tasks(j).flag = 1 Then
                accString = accString & "- [" & tasks(j).name & "] is completed. " & "(WK" & tasks(j).actualDate & ")" & Chr(10)
                shouldAdd = True
              ElseIf tasks(j).status = 2 Then
                accString = accString & "- [" & tasks(j).name & "] is completed." & "(WK" & tasks(j).actualDate & ")" & Chr(10)
                shouldAdd = True
              ElseIf tasks(j).status = 1 And tasks(j).progress >= progressTresholdSetting And dateDifference < 2 Then
                accString = accString & "- [" & tasks(j).name & "] is at " & Round(tasks(j).progress * 100, 0) & "% progress." & Chr(10)
                shouldAdd = True
              End If
              
              
              If shouldAdd Then
                Dim entry As New DBEntry
                entry.id = -1
                entry.projectId = workplan.projectId
                entry.name = tasks(j).name
                entry.lastReported = Date
                entry.lastReportedWeek = currentWeek
                
                AddToDB entry, workplan
              End If
              
              
              
              'Debug.Print entry.toString
              
            Else
            'The activity was found
              'If the task is already reported in the DB, we need to decide if its relevant
              'A task only is relevant if we are reporting on the same week or the difference between lastReportedWeek and current Week is less or equal to [Settings.Reporting_Weeks]
              'Default 1
              
              'For daily workplans, maybe we can keep that settings, because two days is a lot of work.
              
              If workplan.workplanType = 0 Then
                If dbResult.lastReported = currentDate Or ((currentDate - dbResult.lastReportedWeek) <= reportingWeeksSetting) Then
                  'Task is relevant. Now we need to figure out if it is an accomplishment
                  
                  If tasks(j).flag = 1 Then
                    accString = accString & "- [" & tasks(j).name & "] is completed. " & "(WK" & tasks(j).actualDate & ")" & Chr(10)
                  ElseIf tasks(j).status = 2 Then
                    accString = accString & "- [" & tasks(j).name & "] is completed. " & "(WK" & tasks(j).actualDate & ")" & Chr(10)
                  ElseIf tasks(j).status = 1 And tasks(j).progress >= 0.75 And dateDifference < 2 Then
                    accString = accString & "- [" & tasks(j).name & "] is now at " & Round(tasks(j).progress * 100, 0) & "% progress." & Chr(10)
                  End If
                  
                End If
                
              ElseIf workplan.workplanType = 1 Then
                
                'I am not sure if lastReported is the correct type to substract from current Date, so conversion may be needed
                
                'If dbResult.lastReported = currentDate Or ((currentDate - dbResult.lastReported)
                
              End If
              
              
            End If
            
            
            
            'Debug.Print tasks(j).toString
            
          Next j
        End If
        
      End If
      
    Next i
  End If
  
  GenerateAccomplishmentsString = accString
End Function

Private Function GenerateRisksString(workplan As workplan) As String
  Dim risksString As String
      
  ' If workplan is weekly
      
  Dim currentWeek As Integer
  currentWeek = CInt(Split(Fiscal(Date), ":")(2))
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      If workplan.milestones(i).flag = 2 Then
        risksString = risksString & "- [" & workplan.milestones(i).name & "] Milestone, " & workplan.milestones(i).remarks & Chr(10)
        
     End If
      
        Dim tasks As Variant
        tasks = workplan.milestones(i).tasks
        
        If IsArray(tasks) Then
         
          For j = 1 To UBound(tasks)
            Dim dateDifference As Integer
          
            If tasks(j).newFinishDate <> 0 And IsNumeric(tasks(j).newFinishDate) Then
              dateDifference = tasks(j).newFinishDate - currentWeek
            ElseIf tasks(j).finishDate <> 0 And IsNumeric(tasks(j).finishDate) Then
              dateDifference = tasks(j).finishDate - currentWeek
            Else
             dateDifference = 10000
            End If
          
            If tasks(j).flag = 2 Then
              risksString = risksString & "- [" & tasks(j).name & "] " & tasks(j).remarks & Chr(10)
              '          ElseIf tasks(j).status = 3 Then
              'risksString = risksString & "- [" & tasks(j).name & "] Task is On Hold." & Chr(10)
              
            'ElseIf tasks(j).status <> 4 And tasks(j).progress <= 0.25 And dateDifference < 2 Then
            '  risksString = risksString & "- [" & tasks(j).name & "] Task is showing little progress and due date is nigh." & Chr(10)
            Else
            
              ' If task is not completed nor cancelled and is not on time
              Dim timeResult As OnTimeResult: Set timeResult = IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate)
              
              
              If tasks(j).status <> 4 And tasks(j).status <> 3 And Not timeResult.onTime Then
                'Debug.Print IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate), tasks(j).name
                
                If tasks(j).target > 0 Then
                  risksString = risksString & "- [" & tasks(j).name & "] is behind plan (" & tasks(j).completed & " vs " & tasks(j).target & ")" & Chr(10)
                Else
                  risksString = risksString & "- [" & tasks(j).name & "] is behind plan (" & timeResult.weeksBehind & " weeks)" & Chr(10)
                End If
              
                
              End If
              
            End If
          Next j
        End If
      
    Next i
  End If
  GenerateRisksString = risksString
  
End Function

Private Function IsOnTime(taskDuration As Integer, taskProgress As Double, taskStartDate As Integer) As OnTimeResult
  Dim timeResult As New OnTimeResult
  

  If taskProgress >= 1 Then
    timeResult.onTime = True
    timeResult.weeksBehind = 0
    
    Set IsOnTime = timeResult
    Exit Function
  End If
  
  If taskDuration = -1 Then
    
    timeResult.onTime = True
    timeResult.weeksBehind = 0
    
    Set IsOnTime = timeResult
    Exit Function
  End If

  ' If workplan is weekly
      
  Dim currentDate As Integer
  currentDate = CInt(Split(Fiscal(Date), ":")(2))
  
  'Debug.Print taskDuration
  
  'Use task duration to calculate if its current progress against its finishDate to determine if its progress is a problem
  '
  '       Task duration (4 weeks)
  '|-----------------------------------|
  '|--------|--------|--------|--------|
  '
  '       Expected duration (Linear distribution)
  '|-----25%|-----50%|-----75%|----100%|
  '1 Week = 25%
  
  '1 / (task duration) = Expected progress per unit of time
  
  '       Expected duration (Bell Curve)
  '|                   |                   |
  '|----|----|----|----|----|----|----|----|
  '|                   |                   |
  '(Sum)
  '0%  .1%  2.1% 15.8% 50%                100%
  
  Dim ranges As Variant
  ReDim ranges(taskDuration) As Double
  
  Dim expectedProgress As Double
  expectedProgress = 1 / taskDuration
  
  Dim sum As Double
  sum = 0
   
  
   
  For i = 0 To UBound(ranges) - 1
    sum = sum + expectedProgress
    ranges(i) = sum
  Next i
  
  Dim progressStage As Integer
  

  
  For i = 0 To UBound(ranges)
    Dim previousRange As Double
    If i = 0 Then
      previousRange = 0
    Else
      previousRange = ranges(i - 1)
    End If
    
    If taskProgress >= previousRange And taskProgress <= ranges(i) Then
      progressStage = i
    End If
        
  Next i
  
  Dim relativeToday As Integer

  relativeToday = currentDate - taskStartDate
  
  If progressStage < relativeToday Then
    'IsOnTime = False
    timeResult.onTime = False
    timeResult.weeksBehind = relativeToday - progressStage
  Else
    'IsOnTime = True
    timeResult.onTime = True
    timeResult.weeksBehind = relativeToday - progressStage
  End If
  
  Set IsOnTime = timeResult
  
End Function

Private Function GenerateRemarksString(workplan As workplan) As String
  Dim remarksString As String
  remarksString = ""
  
    'If IsArray(workplan.milestones) Then
    ' For i = 1 To UBound(workplan.milestones)
    '   If workplan.milestones(i).flag = 2 Then
    '     remarksString = remarksString & "- [" & workplan.milestones(i).name & "] " & workplan.milestones(i).remarks & Chr(10)
    '   Else
    '     Dim tasks As Variant
    '     tasks = workplan.milestones(i).tasks
    '
    '     If IsArray(tasks) Then
    '
    '       For j = 1 To UBound(tasks)
    '         Dim dateDifference As Integer
    '
    '         If tasks(j).newFinishDate <> 0 And IsNumeric(tasks(j).newFinishDate) Then
    '           dateDifference = tasks(j).newFinishDate - currentWeek
    '         ElseIf tasks(j).finishDate <> 0 And IsNumeric(tasks(j).finishDate) Then
    '           dateDifference = tasks(j).finishDate - currentWeek
    '         Else
    '           dateDifference = 10000
    '         End If
    '
    '         If tasks(j).flag = 2 Then
    '           remarksString = remarksString & "- [" & tasks(j).name & "] " & tasks(j).remarks & Chr(10)
    '         End If
    '       Next j
    '     End If
    '   End If
    ' Next i
    'End If
  
  GenerateRemarksString = remarksString
End Function

Private Function GenerateOnHoldString(workplan As workplan) As String
  
  Dim onHoldString As String
  onHoldString = ""
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      If workplan.milestones(i).status = 3 Then
        onHoldString = onHoldString & "- [" & workplan.milestones(i).name & "] is On Hold. " & workplan.milestones(i).remarks & Chr(10)
      Else
        Dim tasks As Variant
        tasks = workplan.milestones(i).tasks
        
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).status = 3 Then
              onHoldString = onHoldString & "- [" & tasks(j).name & "] is On Hold. " & tasks(j).remarks & Chr(10)
            End If
          Next j
        End If
      End If
    Next i
  End If
  
  GenerateOnHoldString = onHoldString
End Function

Private Function GenerateReportArray(workplan As workplan) As Report()
  
  Dim reportArray() As Report
  
  Dim reportCount As Integer
  
  'I need to iterate over All milestones and tasks
  'Determine which tasks are we going to report.
  'The new behavior is:
  'If a milestone is flagged as Report. We report all its tasks.
  'If a milestone is not flagged, we search inside its tasks and if there is a task with reporting. we only report that task.
  
  Dim addedMilestone As Boolean: addedMilestone = False
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      addedMilestone = False
      Dim tasks As Variant
      tasks = workplan.milestones(i).tasks
      
      If workplan.milestones(i).flag = 0 Then
        reportCount = reportCount + 1
        
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).target > 0 Then
              reportCount = reportCount + 1
            End If
          Next j
        End If
        
      Else
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            'only add the tasks and the milestone if it has not been added.
            If tasks(j).flag = 0 Then
              reportCount = reportCount + 1
              
              If addedMilestone = False Then
                reportCount = reportCount + 1
                addedMilestone = True
              End If
            End If
            

          Next j
        End If
      End If
    Next i
  End If
  
  'Debug.Print reportCount
  
  'Debug.Print "Report count", reportCount
   ReDim reportArray(reportCount) As Report
  
  Dim addIndex As Integer: addIndex = 1
  
  If IsArray(workplan.milestones) Then
    For i = 1 To UBound(workplan.milestones)
      addedMilestone = False
      'Dim tasks As Variant
      tasks = workplan.milestones(i).tasks
      
      If workplan.milestones(i).flag = 0 Then
        Dim milestoneReport As Report
        Set milestoneReport = New Report
        
        milestoneReport.name = workplan.milestones(i).name
        milestoneReport.isTask = False
        
        milestoneReport.progress = workplan.milestones(i).progress
        
        milestoneReport.startDate = ConvertDateIntoWeekFirst(workplan.milestones(i).startDate)
        milestoneReport.finishDate = ConvertDateIntoWeekLast(workplan.milestones(i).finishDate)
        milestoneReport.status = workplan.milestones(i).workStatus
        
        tasks = workplan.milestones(i).tasks
        Set reportArray(addIndex) = milestoneReport
        addIndex = addIndex + 1
        
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).target > 0 Then
              Dim taskReport As Report
              Set taskReport = New Report
              
              taskReport.isTask = True
              taskReport.name = tasks(j).name
              taskReport.startDate = tasks(j).startDate
              
              If tasks(j).newFinishDate <> 0 Then
                taskReport.finishDate = tasks(j).newFinishDate
              Else
                taskReport.finishDate = tasks(j).finishDate
              End If
              
              taskReport.target = tasks(j).target
              taskReport.completed = tasks(j).completed
              taskReport.remaining = tasks(j).remaining
              
              'Calculate task time status which is different than task status
              Dim timeResult As OnTimeResult
              Set timeResult = IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate)
              
              Dim status As Integer
              
              If timeResult.weeksBehind = 0 Then
                status = 1
              ElseIf timeResult.weeksBehind <= taskBehindStatusSetting Then
                status = 2
              ElseIf timeResult.weeksBehind >= taskOutStatusSetting Then
                status = 3
              End If
              
              taskReport.status = status
              
              'Debug.Print timeResult.toString
              
              Set reportArray(addIndex) = taskReport
              addIndex = addIndex + 1
            End If
          Next j
          
        End If
      Else
        If IsArray(tasks) Then
          For j = 1 To UBound(tasks)
            If tasks(j).flag = 0 Then
              'Dim taskReport As Report
              
              If addedMilestone = False Then
                Set milestoneReport = New Report
                milestoneReport.name = workplan.milestones(i).name
                milestoneReport.isTask = False
                
                milestoneReport.progress = workplan.milestones(i).progress
        
                milestoneReport.startDate = ConvertDateIntoWeekFirst(workplan.milestones(i).startDate)
                milestoneReport.finishDate = ConvertDateIntoWeekLast(workplan.milestones(i).finishDate)
                milestoneReport.status = workplan.milestones(i).workStatus
                
                Set reportArray(addIndex) = milestoneReport
                addIndex = addIndex + 1
                
                addedMilestone = True
              End If
              
              
              
              Set taskReport = New Report
              
              taskReport.isTask = True
              taskReport.name = tasks(j).name
              taskReport.startDate = tasks(j).startDate
              
              If tasks(j).newFinishDate <> 0 Then
                taskReport.finishDate = tasks(j).newFinishDate
              Else
                taskReport.finishDate = tasks(j).finishDate
              End If
              
              taskReport.target = tasks(j).target
              taskReport.completed = tasks(j).completed
              taskReport.remaining = tasks(j).remaining
              
              
              Set timeResult = IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate)
              
              
              'taskBehindStatusSetting = CInt(taskBehindStatusRange.value)
              'taskOutStatusSetting
              If timeResult.weeksBehind = 0 Then
                status = 1
              ElseIf timeResult.weeksBehind <= taskBehindStatusSetting Then
                status = 2
              ElseIf timeResult.weeksBehind >= taskOutStatusSetting Then
                status = 3
              End If
              
              taskReport.status = status
              
              'Debug.Print timeResult.toString
              
              
              Set reportArray(addIndex) = taskReport
              addIndex = addIndex + 1
              
            End If
          Next j
        End If
      End If
    Next i
  End If
  
  'Debug.Print UBound(reportArray)

  
  'Dim addIndex As Integer
  'addIndex = 1

  'Generate reporting array
  'If IsArray(workplan.milestones) Then
  '  For i = 1 To UBound(workplan.milestones)
  '    If workplan.milestones(i).flag = 0 Then
  '      Dim milestoneReport As Report
  '      Set milestoneReport = New Report
        
  '      milestoneReport.name = workplan.milestones(i).name
      
        
  '      tasks = workplan.milestones(i).tasks
  '
  '      Set reportArray(addIndex) = milestoneReport
        
  '      addIndex = addIndex + 1
        
  '      If IsArray(tasks) Then
  '        For j = 1 To UBound(tasks)
  '          If tasks(j).target > 0 Then
  '
  '            Dim taskReport As Report
  '            Set taskReport = New Report
              
  '            taskReport.name = tasks(j).name
  '           taskReport.target = tasks(j).target
  '            taskReport.completed = tasks(j).completed
  '            taskReport.remaining = tasks(j).remaining
            
  '            Set reportArray(addIndex) = taskReport
  '            addIndex = addIndex + 1
  '          End If
  '        Next j
  '      End If
  '
  '    End If
  '  Next i
  'End If
  
  
  
  GenerateReportArray = reportArray
End Function

' Cada vez que se esten generando los accomplishments reportados:
' Consultar si lo que se va a reportar es relevante.
' La defincion de relevante es si algo completado ocurrio justo la semana pasada OR no se ha reportado hasta hora.
' Para esto, cuando algo se reporta en ultima instancia, necesitamos agregarlo a la lista persistente de lo ya reportado.
' Necesitamos saber que actividad, de que milestone de que proyecto. Que se reportó exactamente y cuando se hizo. Preferiblemente en terminos de fecha exacta y semanas. Para no batallar con los workplans diarios.


Private Sub FillBlocker(accString As String, riskString As String, remarksString As String, onHoldString As String, reportArray As Variant, workplan As workplan)
  Dim summarySheet As Worksheet
  Set summarySheet = ThisWorkbook.Sheets("Summary")

  Dim blockerTitleRange As Range
  Dim blockerStatusRange As Range
  Dim blockerProgressRange As Range
  Dim blockerAccomplishmentsRange As Range
  Dim blockerRisksRange As Range
  Dim blockerRemarksRange As Range
  Dim blockerOnHoldRange As Range
  
  Set blockerTitleRange = summarySheet.Range("B12")
  Set blockerStatusRange = summarySheet.Range("C13")
  Set blockerProgressRange = summarySheet.Range("H13")
  Set blockerAccomplishmentsRange = summarySheet.Range("B15")
  Set blockerRisksRange = summarySheet.Range("E15")
  Set blockerRemarksRange = summarySheet.Range("B20")
  Set blockerOnHoldRange = summarySheet.Range("E20")
  
  blockerTitleRange.value = workplan.projectName
  blockerStatusRange.value = getProjectStatusString(workplan.projectStatus)
  blockerProgressRange.value = workplan.projectProgress
  
  blockerAccomplishmentsRange.value = accString
  blockerRisksRange.value = riskString
  blockerOnHoldRange.value = onHoldString
  
  If workplan.projectRemarks <> "" Then
    blockerRemarksRange.value = "[Project remarks] " & workplan.projectRemarks & Chr(10) & remarksString
  Else
    blockerRemarksRange.value = remarksString
  End If
  
  summarySheet.Range("B25").value = workplan.projectName
  
  For i = 1 To UBound(reportArray)
    
    If reportArray(i).isTask = False Then
      summarySheet.Range("B" & 26 + i & ":I" & 26 + i).Interior.Color = RGB(239, 239, 239)
      summarySheet.Range("B" & 26 + i & ":H" & 26 + i).Font.Bold = True
      
      summarySheet.Range("B" & 26 + i).value = reportArray(i).name
      
      summarySheet.Range("E" & 26 + i).value = ConvertWKIntoDateFirst(reportArray(i).startDate)
      summarySheet.Range("F" & 26 + i).value = ConvertWKIntoDateLast(reportArray(i).finishDate)
      
      summarySheet.Range("I" & 26 + i).value = reportArray(i).progress
      
      summarySheet.Range("I" & 26 + i).FormatConditions.Delete
      
      Set progressDataBar = summarySheet.Range("I" & 26 + i).FormatConditions.AddDatabar
      progressDataBar.BarFillType = xlDataBarFillGradient
      progressDataBar.BarBorder.Type = xlDataBarBorderSolid
      
      If reportArray(i).status = 1 Then
        progressDataBar.BarColor.Color = RGB(99, 195, 132)
        progressDataBar.BarBorder.Color.Color = RGB(99, 195, 132)
      ElseIf reportArray(i).status = 2 Then
        progressDataBar.BarColor.Color = RGB(255, 192, 0)
        progressDataBar.BarBorder.Color.Color = RGB(255, 182, 40)
      Else
        progressDataBar.BarColor.Color = RGB(255, 85, 90)
        progressDataBar.BarBorder.Color.Color = RGB(255, 85, 90)
      End If
  
    Else
      summarySheet.Range("B" & 26 + i).Font.Bold = False
      summarySheet.Range("B" & 26 + i).value = reportArray(i).name
      summarySheet.Range("B" & 26 + i).IndentLevel = 1
      
    '      Dim first As Date: first =
    'Dim last As Date: last =
      summarySheet.Range("E" & 26 + i).value = ConvertWKIntoDateFirst(reportArray(i).startDate)
      summarySheet.Range("F" & 26 + i).value = ConvertWKIntoDateLast(reportArray(i).finishDate)
      
      summarySheet.Range("G" & 26 + i).value = reportArray(i).target
      summarySheet.Range("G" & 26 + i).NumberFormat = "#,##0"
      
      summarySheet.Range("H" & 26 + i).value = reportArray(i).remaining
      summarySheet.Range("H" & 26 + i).NumberFormat = "#,##0"
      
      If reportArray(i).target > 0 Then
        summarySheet.Range("I" & 26 + i).value = Round(reportArray(i).completed / reportArray(i).target, 2)
      Else
        summarySheet.Range("I" & 26 + i).value = 0
      End If
      
      summarySheet.Range("I" & 26 + i).FormatConditions.Delete
      
      
      
      Set progressDataBar = summarySheet.Range("I" & 26 + i).FormatConditions.AddDatabar
      progressDataBar.BarFillType = xlDataBarFillGradient
      progressDataBar.BarBorder.Type = xlDataBarBorderSolid
      
      
      
      progressDataBar.MinPoint.Modify newtype:=xlConditionValueNumber, newvalue:=0
      progressDataBar.MaxPoint.Modify newtype:=xlConditionValueNumber, newvalue:=1
      
      If reportArray(i).status = 1 Then
        progressDataBar.BarColor.Color = RGB(99, 195, 132)
        progressDataBar.BarBorder.Color.Color = RGB(99, 195, 132)
      ElseIf reportArray(i).status = 2 Then
        progressDataBar.BarColor.Color = RGB(255, 192, 0)
        progressDataBar.BarBorder.Color.Color = RGB(255, 182, 40)
      Else
        progressDataBar.BarColor.Color = RGB(255, 85, 90)
        progressDataBar.BarBorder.Color.Color = RGB(255, 85, 90)
      End If
  
      'summarySheet.Range("K" & 26 + i).value = reportArray(i).status
    End If
  

  Next
  
  'Dim entry As New DBEntry
  
  'entry.id = 1
  'entry.projectId = workplan.projectId
  'entry.name = "Testing"
  'entry.lastReported = Date
  'entry.lastReportedWeek = 12
  
  
  'AddToDB entry, workplan
  'On Error Resume Next


  'Dim result As DBEntry
  'Set result = SearchInDB("Testing", workplan)
  'Debug.Print result.toString
End Sub


Private Sub FillInWorkReport(workplan As workplan)
  Dim targetWorksheet As Worksheet
  Set targetWorksheet = ThisWorkbook.Sheets("Summary")
  
  
  targetWorksheet.Range("L25").value = workplan.projectName
  
  If IsArray(workplan.milestones) Then
     
    Dim rowIndex As Integer: rowIndex = 27
     
    For i = 1 To UBound(workplan.milestones)
      Dim progressDataBar As Databar
           
            
      'I think I only want to show completed and in work milestones. I think
      If workplan.milestones(i).status <> 2 Then
        'Milestone is in work
        
        targetWorksheet.Range("L" & rowIndex & ":Q" & rowIndex).Interior.Color = RGB(239, 239, 239)
        targetWorksheet.Range("L" & rowIndex & ":Q" & rowIndex).VerticalAlignment = xlCenter
        targetWorksheet.Range("L" & rowIndex & ":Q" & rowIndex).RowHeight = 18.75
        
        targetWorksheet.Range("L" & rowIndex).IndentLevel = 0
        targetWorksheet.Range("L" & rowIndex).value = workplan.milestones(i).name
        targetWorksheet.Range("L" & rowIndex).Font.Bold = True
        
        targetWorksheet.Range("M" & rowIndex).value = workplan.milestones(i).startDate
        targetWorksheet.Range("M" & rowIndex).Font.Bold = True
        
        targetWorksheet.Range("N" & rowIndex).value = workplan.milestones(i).finishDate
        targetWorksheet.Range("N" & rowIndex).Font.Bold = True
        
        targetWorksheet.Range("Q" & rowIndex).value = workplan.milestones(i).progress
        
        
        targetWorksheet.Range("Q" & rowIndex).FormatConditions.Delete
        
        Set progressDataBar = targetWorksheet.Range("Q" & rowIndex).FormatConditions.AddDatabar
        progressDataBar.BarFillType = xlDataBarFillGradient
        progressDataBar.BarBorder.Type = xlDataBarBorderSolid
        
        progressDataBar.MinPoint.Modify newtype:=xlConditionValueNumber, newvalue:=0
        progressDataBar.MaxPoint.Modify newtype:=xlConditionValueNumber, newvalue:=1
        
        If workplan.milestones(i).workStatus = 1 Then
          progressDataBar.BarColor.Color = RGB(99, 195, 132)
          progressDataBar.BarBorder.Color.Color = RGB(99, 195, 132)
        ElseIf workplan.milestones(i).workStatus = 2 Then
          progressDataBar.BarColor.Color = RGB(255, 192, 0)
          progressDataBar.BarBorder.Color.Color = RGB(255, 182, 40)
        Else
          progressDataBar.BarColor.Color = RGB(255, 85, 90)
          progressDataBar.BarBorder.Color.Color = RGB(255, 85, 90)
        End If
        
        rowIndex = rowIndex + 1
        
        If IsArray(workplan.milestones(i).tasks) Then
          Dim tasks As Variant
          tasks = workplan.milestones(i).tasks
          
          For j = 1 To UBound(tasks)
            
            If tasks(j).status <> 2 Then
              targetWorksheet.Range("L" & rowIndex & ":Q" & rowIndex).Interior.Color = RGB(255, 255, 255)
              targetWorksheet.Range("L" & rowIndex & ":Q" & rowIndex).VerticalAlignment = xlCenter
              
              targetWorksheet.Range("L" & rowIndex).value = tasks(j).name
              targetWorksheet.Range("L" & rowIndex).Font.Bold = False
              targetWorksheet.Range("L" & rowIndex).IndentLevel = 1
              
              targetWorksheet.Range("M" & rowIndex).value = ConvertWKIntoDateFirst(tasks(j).startDate)
              targetWorksheet.Range("M" & rowIndex).Font.Bold = False
              
              If IsNumeric(tasks(j).newFinishDate) And tasks(j).newFinishDate <> 0 Then
                targetWorksheet.Range("N" & rowIndex).value = ConvertWKIntoDateLast(tasks(j).newFinishDate)
              Else
                targetWorksheet.Range("N" & rowIndex).value = ConvertWKIntoDateLast(tasks(j).finishDate)
              End If
              
              targetWorksheet.Range("N" & rowIndex).Font.Bold = False
              
              If tasks(j).target <> 0 Then
                targetWorksheet.Range("O" & rowIndex).value = tasks(j).target
                targetWorksheet.Range("O" & rowIndex).Font.Bold = False
                
                targetWorksheet.Range("P" & rowIndex).value = tasks(j).remaining
                targetWorksheet.Range("P" & rowIndex).Font.Bold = False
                
              End If
              
              targetWorksheet.Range("Q" & rowIndex).value = tasks(j).progress
              targetWorksheet.Range("Q" & rowIndex).Font.Bold = False
              
              targetWorksheet.Range("Q" & rowIndex).FormatConditions.Delete
              
              Dim timeResult As OnTimeResult
              
              Set timeResult = IsOnTime(tasks(j).duration, tasks(j).progress, tasks(j).startDate)
              
              Set progressDataBar = targetWorksheet.Range("Q" & rowIndex).FormatConditions.AddDatabar
              progressDataBar.BarFillType = xlDataBarFillGradient
              progressDataBar.BarBorder.Type = xlDataBarBorderSolid
        
              progressDataBar.MinPoint.Modify newtype:=xlConditionValueNumber, newvalue:=0
              progressDataBar.MaxPoint.Modify newtype:=xlConditionValueNumber, newvalue:=1
              
              If timeResult.weeksBehind < 2 Then
                progressDataBar.BarColor.Color = RGB(99, 195, 132)
                progressDataBar.BarBorder.Color.Color = RGB(99, 195, 132)
              ElseIf timeResult.weeksBehind >= 2 And timeResult.weeksBehind < 4 Then
                progressDataBar.BarColor.Color = RGB(255, 192, 0)
                progressDataBar.BarBorder.Color.Color = RGB(255, 182, 40)
              ElseIf timeResult.weeksBehind >= 4 Then
                progressDataBar.BarColor.Color = RGB(255, 85, 90)
                progressDataBar.BarBorder.Color.Color = RGB(255, 85, 90)
              End If
              
              If tasks(j).flag = 2 Or timeResult.weeksBehind > 2 Then
                Dim text As String: text = targetWorksheet.Range("L" & rowIndex).value
                
                text = text & " (Risk)"
                
                targetWorksheet.Range("L" & rowIndex).value = text
                
              End If
              rowIndex = rowIndex + 1
            End If
            
          Next j
          
          
        End If
        
        
      ElseIf workplan.milestones(i).status = 2 Then
        'Milestone is completed
        
        targetWorksheet.Range("L" & rowIndex & ":Q" & rowIndex).Interior.Color = RGB(239, 239, 239)
        
        targetWorksheet.Range("L" & rowIndex).IndentLevel = 0
        targetWorksheet.Range("L" & rowIndex).value = workplan.milestones(i).name
        targetWorksheet.Range("L" & rowIndex).Font.Bold = True
        targetWorksheet.Range("L" & rowIndex).VerticalAlignment = xlCenter
        
        targetWorksheet.Range("M" & rowIndex).value = workplan.milestones(i).startDate
        targetWorksheet.Range("M" & rowIndex).Font.Bold = True
        
        targetWorksheet.Range("N" & rowIndex).value = workplan.milestones(i).finishDate
        targetWorksheet.Range("N" & rowIndex).Font.Bold = True
        
        targetWorksheet.Range("Q" & rowIndex).value = workplan.milestones(i).progress
        
        targetWorksheet.Range("Q" & rowIndex).FormatConditions.Delete
        
        Set progressDataBar = targetWorksheet.Range("Q" & rowIndex).FormatConditions.AddDatabar
        progressDataBar.BarFillType = xlDataBarFillGradient
        progressDataBar.BarBorder.Type = xlDataBarBorderSolid
        
        progressDataBar.MinPoint.Modify newtype:=xlConditionValueNumber, newvalue:=0
        progressDataBar.MaxPoint.Modify newtype:=xlConditionValueNumber, newvalue:=1
        
        progressDataBar.BarColor.Color = RGB(99, 195, 132)
        progressDataBar.BarBorder.Color.Color = RGB(99, 195, 132)
        
        rowIndex = rowIndex + 1
      End If
      
    Next i
     
  End If
  
  
End Sub

'Utility functions

Private Function AddToDB(element As DBEntry, workplan As workplan) As Boolean
  Dim result As Boolean

  'Para agregar un elemento a la BD
  'Se busca el apartado de su projecto, se agrega antes del apartado del siguiente proyecto y tan tan

  'El archivo tiene la siguiente estructura
  
  'Inicio (Implicito)
  'Project:   id
  ' > [entryProperties] (Separator: ,)
  ' > [entryProperties] (Separator: ,)
  '----
    'Project:   id
  ' > [entryProperties] (Separator: ,)
  ' > [entryProperties] (Separator: ,)
  '----
  'Fin (Implicito)
  
  'Leer la string del archivo
  'Separarla en un arreglo en base a los saltos de linea
  'Revisar las lineas que contengan "Project: "
  'De ser el caso, hacemos split con el ":"
  'Tomamos el segundo elemento de ese split y lo comparamos al project id
  'Si son iguales, buscamos el elemento en la lista hasta que tengamos un "----"
  
  On Error GoTo ManageError
  
ReadFile:
  Dim fSystemObject As Object
  Set fSystemObject = CreateObject("Scripting.FileSystemObject")
  Set file = fSystemObject.OpenTextFile(reportingFilePathSetting, 1, 0)
  
  Dim fileLines As Variant
  
  fileLines = Split(file.ReadAll(), Chr(10))
  
  
  file.Close

WriteFile:
  If UBound(fileLines) > 1 Then
    Dim partIndex As Integer
    partIndex = -1
  
    Dim currentEntryId As Integer: currentEntryId = 0
  
    Dim shouldAddProject As Boolean: shouldAddProject = True
  
    For i = 0 To UBound(fileLines)
      'Debug.Print i
      If InStr(1, fileLines(i), "Project: ") <> 0 Then

        Dim projectId As String
        projectId = Trim(Split(fileLines(i), ":")(1))
        If projectId = workplan.projectId Then
          shouldAddProject = False
          'Desde aqui hasta el siguiente ----, encuentra el i
          
          For j = i To UBound(fileLines)
            Dim line As String
            line = fileLines(j)
            If line = "----" Then
              partIndex = j
              Exit For
            Else
              currentEntryId = currentEntryId + 1
            End If
          Next j
          
          Exit For
        End If
      End If
    Next i
    
    Dim preString As String
    preString = ""
      
    Dim posString As String
    posString = ""
      
    Dim entryString As String
    Dim nextId As Integer
    
    If shouldAddProject = True Then
      'Dim fileLine As String
      
      For i = 0 To UBound(fileLines)
      
        preString = preString & fileLines(i) & Chr(10)
      Next i
      
      preString = Trim(preString)
      
      preString = preString & "Project: " & workplan.projectId & Chr(10)
      
      'Debug.Print preString
      If nextId <= 0 Then
        nextId = 1
      End If
      
      entryString = "> " & nextId & ", " & workplan.projectId & ", " & element.name & ", " & element.lastReported & ", " & element.lastReportedWeek & Chr(10)
    
      Set file = fSystemObject.OpenTextFile(reportingFilePathSetting, 2, 0)
      file.Write preString & entryString & "----"
    Else
      

      
      'Debug.Print currentEntryId, "aa"
      
      nextId = currentEntryId
      
      entryString = "> " & nextId & ", " & workplan.projectId & ", " & element.name & ", " & element.lastReported & ", " & element.lastReportedWeek & Chr(10)
      
      If partIndex <> -1 Then
        'Get string of file up until this index
        
        For i = 0 To partIndex - 1
          preString = preString & fileLines(i) & Chr(10)
        Next i
        
        For i = partIndex To UBound(fileLines)
          posString = posString & fileLines(i) & Chr(10)
        Next i
        
        posString = Application.WorksheetFunction.Clean(posString)
        
        Set file = fSystemObject.OpenTextFile(reportingFilePathSetting, 2, 0)
        file.Write preString & entryString & posString
        file.Close
        
      End If
    End If
    

  
  Else
    'Add whole project
    Set file = fSystemObject.OpenTextFile(reportingFilePathSetting, 8, 0)
    file.Write "Project: " & workplan.projectId & Chr(10)
    file.Write "> " & 1 & ", " & workplan.projectId & ", " & element.name & ", " & element.lastReported & ", " & element.lastReportedWeek & Chr(10)
    file.Write "----"
    file.Close
  End If
  

  Exit Function
  
ManageError:
  If Err.Number = 53 Then
    ' Create file and try again
    Set infoFile = fSystemObject.CreateTextFile(reportingFilePathSetting, True)
    infoFile.Write ("# Reporting file for Angeles. DO NOT DELETE!" & Chr(10))
    infoFile.Close
    
    GoTo ReadFile
  ElseIf Err.Number = 76 Then
    MsgBox "Reporting file not found. Please consult specialist."
  End If
  MsgBox Err.Description
End Function

Private Function SearchInDB(elementName As String, workplan As workplan) As DBEntry
  
  'Read the file string
  'If we find the project
  'Read line by line until "----"
  'If its there, retrieve information by splitting the line
  'If not, return nil or something like that.
  
  
  On Error GoTo ManageError
  Dim fSystemObject As Object
  Set fSystemObject = CreateObject("Scripting.FileSystemObject")
  Set file = fSystemObject.OpenTextFile(reportingFilePathSetting, 1, 0)
  
  Dim fileLines As Variant
  
  fileLines = Split(file.ReadAll(), Chr(10))
  
  file.Close
  
  For i = 0 To UBound(fileLines)
    If InStr(1, fileLines(i), "Project: ") <> 0 Then
      Dim projectId As String
      projectId = Trim(Split(fileLines(i), ":")(1))
      
      If projectId = workplan.projectId Then
        For j = i + 1 To UBound(fileLines)
          Dim line As String
          line = fileLines(j)
          If line <> "----" Then
            Dim activityName As String
   
            
            Dim properties As Variant
            properties = Split(Mid(Trim(line), 3, Len(line)), ",")
            
            'Debug.Print UBound(properties)
            'Debug.Print properties(1)
            'Debug.Print properties(2)
            'Debug.Print properties(3)
            'Debug.Print properties(4)
            
          
            activityName = Trim(properties(2))
            'Debug.Print activityName
          
            If activityName = elementName Then
              Dim entry As New DBEntry
              'entry.id = CINT(
              entry.projectId = workplan.projectId
              entry.id = CInt(properties(0))
              entry.name = activityName
              entry.lastReported = CDate(properties(3))
              entry.lastReportedWeek = CInt(properties(4))
              Set SearchInDB = entry
              Exit Function
            End If
          Else
            
            entry.name = "11010011"
            Set SearchInDB = entry
            Exit For
          End If
        Next j
      End If
    Else
     
      entry.name = "11010011"
      Set SearchInDB = entry
      
  
    End If
   
  Next i
  'Debug.Print entry.toString
  
  'Debug.Print Hola.adios
  Exit Function
ManageError:
  If Err.Number = 53 Then
    Dim result As DBEntry
    Set result = Nothing
    Set SearchInDB = result
  Else
    MsgBox Err.Description
  End If

End Function

Private Function ConvertWKIntoDateFirst(week As Integer) As Date
  Dim startDayFY As Date
  startDayFY = DateSerial(2023, 8, 27)
  
  Dim firstDay As Date
  firstDay = startDayFY + (week * 7) - 6
  
  ConvertWKIntoDateFirst = firstDay
End Function

Private Function ConvertWKIntoDateLast(week As Integer) As Date
  Dim startDayFY As Date
  startDayFY = DateSerial(2023, 8, 27)
  
  Dim lastDay As Date
  lastDay = startDayFY + (week * 7) - 2
  
  ConvertWKIntoDateLast = lastDay
End Function

Private Function ConvertDateIntoWeekFirst(first As Date) As Integer
  'Debug.Print first / 7 - 6
  
  Dim week As Integer
  
  Dim startDayFY As Date
  startDayFY = DateSerial(2023, 8, 27)
  
  'Debug.Print first
  
  week = (first + 6 - startDayFY) / 7
  
  If week = 0 Then
    week = 1
  End If
  
  ConvertDateIntoWeekFirst = week
End Function

Private Function ConvertDateIntoWeekLast(last As Date) As Integer
  Dim week As Integer
  
  Dim startDayFY As Date
  startDayFY = DateSerial(2023, 8, 27)
  
  week = (last + 2 - startDayFY) / 7

  ConvertDateIntoWeekLast = week
End Function

Private Function getStatusInt(status As String) As Integer
  If LCase(status) = LCase("Not Started") Then
    getStatusInt = 0
    
  ElseIf LCase(status) = LCase("In Work") Then
    getStatusInt = 1
    
  ElseIf LCase(status) = LCase("Completed") Then
    getStatusInt = 2
    
  ElseIf LCase(status) = LCase("On Hold") Then
    getStatusInt = 3
    
  ElseIf LCase(status) = LCase("Cancelled") Then
    getStatusInt = 4
  End If
End Function

Private Function getStatusString(status As Integer) As String
  If status = 0 Then
    getStatusString = "Not Started"
  ElseIf status = 1 Then
    getStatusString = "In Work"
  ElseIf status = 2 Then
    getStatusString = "Completed"
  ElseIf status = 3 Then
    getStatusString = "On Hold"
  ElseIf status = 4 Then
    getStatusString = "Cancelled"
  End If
  
End Function

Private Function getFlagInt(flag As String) As Integer

  If flag = "Report" Then
    getFlagInt = 0
  ElseIf flag = "Completed" Then
    getFlagInt = 1
  ElseIf flag = "Risk" Then
    getFlagInt = 2
  Else
    getFlagInt = -1
  End If
End Function

Private Function getProjectStatusString(status As Integer) As String
  If status = 1 Then
    getProjectStatusString = "On Track"
  ElseIf status = 2 Then
    getProjectStatusString = "Behind"
  ElseIf status = 3 Then
    getProjectStatusString = "Out of track"
  End If
End Function

Private Function GetAddressForKey(key As String, version As String, DataBridge As DataBridge) As String
  
  Dim address As String

  If version = "v3" Then
    address = CallByName(DataBridge, key, VbGet)
  End If
  
  GetAddressForKey = address
End Function

