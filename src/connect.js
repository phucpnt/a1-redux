import {
  isArray,
  isFunction,
  extend,
  forEach,
} from 'angular';
import invariant from 'invariant';

export default function connect({
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
      const $nuScope = $scope;

      function mapState() {
        forEach(mapStateToScope(ngStore.getState), (val, key) => {
          $nuScope[key] = val;
        });
      }

      const unsubscribe = ngStore.subscribe(mapState);
      $nuScope.$on('$destroy', unsubscribe);
      mapState();

      forEach(mapDispatchToScope(ngStore.dispatch, ngStore.getState), (val, key) => {
        $nuScope[key] = val;
      });

      return dirApi.link($nuScope, $element, $attrs, ...more);
    }

    return extend({}, dirApi, {
      link: wrappedLink,
    });
  };

  const finalDirDef = wrappedDirectiveDependency.concat(wrappedDirectiveFun);

  return finalDirDef;
}
