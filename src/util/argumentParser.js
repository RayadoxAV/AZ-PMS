/* 
  Author: Raymundo Paz
  Date: 02/22/2024
  Arugment parser for the whole tool. Aims to remove positional arguments and provide safety.
*/

class ArgumentParser {
  static getArguments() {
    /* Arguments  */
    const programArguments = [...process.argv];
    const argumentMap = new Map();

    argumentMap.set('--path', false);
    argumentMap.set('--id', false);
    argumentMap.set('--link', false);

    const argNames = [...argumentMap.keys()];



    for (let i = 0; i < programArguments.length; i++) {
      const arg = programArguments[i];
      
      if (argumentMap.get(arg)) {
        continue;
      }

      if (argNames.includes(arg)) {
        const value = programArguments[i + 1];

        if (value) {
          if (value.startsWith('--') || value.startsWith('-')) {
            argumentMap.set(arg, false);
          } else {
            argumentMap.set(arg, value);
          }
        }
      }
    }

    const args = {
      path: argumentMap.get('--path'),
      projectId: argumentMap.get('--id'),
      link: argumentMap.get('--link')
    };

    
    return args;
  }
}

module.exports = {
  ArgumentParser
};

