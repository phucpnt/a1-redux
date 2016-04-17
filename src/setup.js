import {
  createStore,
  applyMiddleware,
} from 'redux';
import makePropTypesDirective from './directive-proptypes';

const ActionTypes = {
  INIT: '@@redux/INIT',
};

/**
 *
 * @param app {{angular}}
 */
function angularSetup(app) {
  /**
   * understanding angular provider: https://www.evernote.com/shard/s16/sh/93652e36-4492-438d-94e3-86714b8ed49e/d885f65c9a74675c3d22cb4ff1d9df56
   */
  app.provider('ngStore', function () { // because we need the context `this`
    let state = {};
    let currentUpdater = currentState => currentState;
    let dispatchLayers = [];


    this.setInitialState = initialState => {
      state = initialState;
    };

    this.setReducers = this.putUpdaters = updater => {
      currentUpdater = updater;
    };

    this.putLayers = layers => {
      dispatchLayers = layers;
    };

    this.$get = ['$timeout',
    function ($timeout) {
        function digestAngularUI() {
          return (nextLayer) => (action) => {
            let result;
            try {
              result = nextLayer(action);
            } catch (e) {
              console.error('DISPATCH ERROR >>> ', e);
            }

            // update the UI on angular, make sure changes in state will be in the $digest circle
            $timeout(() => result);
            return result;
          };
        }

        dispatchLayers.unshift(digestAngularUI);

        const finalStore = createStore(currentUpdater, state, applyMiddleware(...dispatchLayers));

        return finalStore;
    }];
  });


  app.run(['ngStore', (store) => {
    store.dispatch({
      type: ActionTypes.INIT,
    });
  }]);

  app.directive = makePropTypesDirective(app.directive.bind(app));

  return app;
}

export default angularSetup;
