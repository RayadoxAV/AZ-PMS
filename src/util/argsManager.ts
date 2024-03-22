/* 
  Raymundo Paz
  March 2024
*/

import { CustomError, ErrorManager } from '../data/error/errorManager'

export interface ArgumentsObject {
  path?: string;
  projectId: string;
  link?: string;
}

export class ArgumentsManager {
  static parseArguments(): ArgumentsObject {
    const programArguments = [...process.argv];

    const argumentMap = new Map<String, String>();

    argumentMap.set('--path', '');
    argumentMap.set('--id', '');
    argumentMap.set('--link', '');

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
            argumentMap.set(arg, '');
          } else {
            argumentMap.set(arg, value);
          }
        }
      }
    }

    const args: ArgumentsObject = {
      path: `${argumentMap.get('--path')}`,
      projectId: `${argumentMap.get('--id')}`,
      link: `${argumentMap.get('--link')}`
    };

    if ((!args.path && !args.link) || !args.projectId) {
      // TODO: Error state, send to error manager
      // throw new Error('Not enough arguments');
      ErrorManager.throwError(new CustomError('Soomething bad happened', 'Exceptoin', true, false, 'Mamaste riel mijo'))
    }

    return args;
  }
}
