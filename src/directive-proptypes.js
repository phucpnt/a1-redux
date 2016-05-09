import {
    isFunction,
} from 'angular';

function check(props, propTypes, name) {
  for (let prop in propTypes) {
    if (propTypes.hasOwnProperty(prop)) {
      let err = propTypes[prop](props, prop, name, 'prop');
      if (err) {
        console.warn(err);
        return false;
      }
    }
  }
  return true;
}

function applyDefaultProps($scope, defaultProps) {
  const $nuScope = $scope;
  for (let key in defaultProps) {
    if (typeof $scope[key] === 'undefined') {
      $nuScope[key] = defaultProps[key];
    }
  }
  return $nuScope;
}

function makeDirectiveApiSuggested(app) {
  const aDirectiveRegisterFun = app.directive.bind(app);
  app.directive = (name, directiveFactory) => {
    const directiveFun = isFunction(directiveFactory) ? directiveFactory : directiveFactory.slice(-1)[0];
    const finalDirectiveFactory = [].concat(directiveFactory);

    function wrappedDirFun() {
      const dirDef = directiveFun.apply(null, arguments);

      if (!dirDef._propTypes_) {
        console.warn(`directive ** ${name} ** not having _propTypes_ defined.
Defining the _propTypes_ allow developer easy to understand which data should provide to to directive`);
      }

      const dirLinkFun = dirDef.link;

      function wrappedDirLinkFun($scope, ...more) {
        let $nuScope = $scope;
        if (typeof dirDef._getDefaultProps_ === 'function') {
          $nuScope = applyDefaultProps($nuScope, dirDef._getDefaultProps_());
        }
        if (check($nuScope, dirDef._propTypes_, name)) {
          return dirLinkFun($nuScope, ...more);
        }
        throw new Error(`properties of directive **${name}** is not provided correctly!`);
      }

      dirDef.link = wrappedDirLinkFun;
      dirDef.scope = dirDef.scope || {}; // make the scope isolate

      for (let key in dirDef._propTypes_) {
        dirDef.scope[key] = '<?'; // 1 one binding data.
      }

      return dirDef;
    }

    finalDirectiveFactory.splice(-1, 1, wrappedDirFun);

    return aDirectiveRegisterFun(name, finalDirectiveFactory);
  };
  return app;
}

export default makeDirectiveApiSuggested;
