import createStore from 'redux';

const ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 *
 * @param app {{angular}}
 */
function angularSetup(app) {

  /**
   * understanding angular provider: https://www.evernote.com/shard/s16/sh/93652e36-4492-438d-94e3-86714b8ed49e/d885f65c9a74675c3d22cb4ff1d9df56
   */
  app.provider('ngStore', function () {

    var state = {},
        currentUpdater = function (action, currentState) {
          return currentState;
        },
        dispatchLayers = [];


    this.putInitialState = function (initialState) {
      state = initialState;
    };

    this.putUpdater = function (updater) {
      currentUpdater = updater;
    };

    //noinspection JSPotentiallyInvalidUsageOfThis
    this.putLayers = function (layers) {
      dispatchLayers = layers;
    };

    this.$get = ['$timeout', function ($timeout) {
      function digestAngularUI(store /*{getState, dispatch}*/) {
        return function (nextLayer) {
          return function (action) {
            var result;
            try {
              result = nextLayer(action);
            } catch (e) {
              console.error('DISPATCH ERROR >>> ', e);
            }
            $timeout(function () { // update the UI on angular
              return result;
            });
            return result;
          }
        }
      }

      var makeStore = createStore;

      if(window.devToolsExtension){ // integrating 3rd party dev tools
        makeStore = window.devToolsExtension()(createStore);
      }

      dispatchLayers.unshift(digestAngularUI);

      return applyDispatchLayers(dispatchLayers)(makeStore)(currentUpdater, state);
    }];
  });


  app.run(['ngStore', function (store) {
    store.dispatch({type: ActionTypes.INIT});
  }]);

}
