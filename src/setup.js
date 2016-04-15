import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux';

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

    let state = {};
    let currentUpdater = (action, currentState) => currentState;
    let dispatchLayers = [];


    this.putInitialState = initialState => {
      state = initialState;
    };

    this.putUpdater = updater => {
      currentUpdater = updater;
    };

    //noinspection JSPotentiallyInvalidUsageOfThis
    this.putLayers = layers => {
      dispatchLayers = layers;
    };

    this.$get = ['$timeout',
    function ($timeout) {
        function digestAngularUI({getState, dispatch}) {
          return (nextLayer) => (action) => {
            let result;
            try {
              result = nextLayer(action);
            } catch (e) {
              console.error('DISPATCH ERROR >>> ', e);
            }
            $timeout(() => result); // update the UI on angular
            return result;
          };
        }


        // if (window.devToolsExtension) { // integrating 3rd party dev tools
        //   makeStore = window.devToolsExtension()(createStore);
        // }

        dispatchLayers.unshift(digestAngularUI);

        const finalStore = createStore(currentUpdater, state, applyMiddleware(...dispatchLayers));

        return finalStore;

    },
  ];
  });


  app.run(['ngStore', function (store) {
    store.dispatch({
      type: ActionTypes.INIT
    });
  }]);

  return app;
}

export default angularSetup;
