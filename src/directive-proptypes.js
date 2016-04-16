import {
  isFunction
} from 'angular';

import PropTypes from 'proptypes';

function check(props, propTypes) {
  for (let prop in propTypes) {
    if (propTypes.hasOwnProperty(prop)) {
      let err = propTypes[prop](props, prop, 'name', 'prop');
      if (err) {
        console.warn(err);
        return false;
      }
    }
  }
  return true;
}

function makeDirectiveApiSuggested(aDirectiveRegisterFun) {
  return (name, directiveFactory) => {
    console.log(directiveFactory);
    const directiveFun = isFunction(directiveFactory) ? directiveFactory : directiveFactory.slice(-1)[0];
    const finalDirectiveFactory = [].concat(directiveFactory);
    console.log(directiveFun);

    function wrappedDirFun(...args) {
      const dirDef = directiveFun(...args);

      if (!dirDef._propsTypes_) {
        console.warn(`directive **${name}** not having _propTypes_ defined.
Defining the _api_ allow developer easy to understand which data should provide to to directive`);
      }

      const dirLinkFun = dirDef.link;

      function wrappedDirLinkFun($scope, ...more) {
        if (check($scope, dirDef._api_)) {
          return dirLinkFun($scope, ...more);
        }
        throw new Error(`properties of directive **${name}** is not provided correctly!`);
      }
      dirDef.link = wrappedDirLinkFun;
      console.log(dirDef);

      return dirDef;
    }

    finalDirectiveFactory.splice(-1, 1, wrappedDirFun);

    return aDirectiveRegisterFun(name, finalDirectiveFactory);
  };
}

export default makeDirectiveApiSuggested;
