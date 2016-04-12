import {
  isArray,
  isFunction,
  extend,
} from 'angular';
import invariant from 'invariant';

export function connect({
  mapStateToScope,
  mapDispatchToScope,
}, directiveDef) {
  invariant(isFunction(directiveDef) || isArray(directiveDef),
    'invalid definition of angular directive definition. Should be array or function');
  invariant(isFunction(mapStateToScope), 'should be function with store state as param');
  invariant(isFunction(mapDispatchToScope), 'should be function with store dispatch, state as param');

  const directiveFun = isFunction(directiveDef) ? directiveDef : directiveDef[directiveDef.length - 1];
  const directiveDependency = isArray(directiveDef) && directiveDef.length >= 2 ?
    directiveDef.slice(0, directiveDef.length - 2) : [];

  const wrappedDirectiveDependency = directiveDependency.concat('ngStore');

  const wrappedDirectiveFun = (...args) => {
    const ngStore = args[args.length - 1];
    const dirApi = directiveFun(...args);

    invariant(isFunction(dirApi.link), 'directive link must be defined as a function');

    function wrappedLink($scope, $element, $attrs, ...more) {
      let $nuScope = extend($scope, mapStateToScope(ngStore.getState()));
      $nuScope = extend($nuScope, mapDispatchToScope(ngStore.dispatch, ngStore.getState()));

      return dirApi.link($nuScope, $element, $attrs, ...more);
    }

    return extend(dirApi, {
      link: wrappedLink,
    });
  };

  return wrappedDirectiveDependency.concat(wrappedDirectiveFun);
}
