import {
  expect
} from 'chai';
import setup from '../src/setup';
import connect from '../src/connect';
import angular from 'angular';
import 'angular-mocks';
import sinon from 'sinon';

describe('Container Connect', () => {
  let app;
  let $compile;
  let $rootScope;

  function testDirDef() {
    return {
      scope: {},
      link($scope) {
        return $scope;
      },
      template: '<div>hello {{hello}}</div>',
    };
  }

  function testDirInteractDef() {
    return {
      scope: {},
      link($scope) {
        return $scope;
      },
      template: `
      <div>
        hello {{hello}}
        <button ng-click="changeHello()">change hello</button>
      </div>
    `,
    };
  }

  function angularInject(html = '<test-dir/>') {
    angular.mock.module('test');
    angular.mock.inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
    const $nuScope = $rootScope.$new(true);
    const $element = $compile(html)($nuScope);
    $nuScope.$digest();
    return $element;
  }

  beforeEach(() => {
    app = setup(angular.module('test', []));
  });

  it('should support injecting attributes into directive scope', () => {
    const wrappedDirDef = connect({
      mapStateToScope: () => ({
        hello: 'world',
      }),
      mapDispatchToScope: () => {},
    }, testDirDef);
    app.directive('testDir', wrappedDirDef);

    const $element = angularInject();
    expect($element.html()).to.contain('hello world');
  });

  it('should delegate state change in store', (done) => {
    const containerDirFactory = connect({
      mapStateToScope: (getState) => ({
        hello: getState().hello,
      }),
      mapDispatchToScope: () => {},
    }, testDirDef);

    app.directive('testDir', containerDirFactory);
    // add reducer
    app.config(['ngStoreProvider', (provider) => {
      provider.setReducers((state, action) => {
        switch (action.type) {
          case 'hello':
            let nuState = state;
            nuState.hello = action.hello;
            return nuState;
          default:
            return state;
        }
      });
    }]);

    let storeExposed;
    app.run(['ngStore', (store) => {
      storeExposed = store;
    }]);

    const $element = angularInject();

    // dispatch an action.
    storeExposed.dispatch({
      type: 'hello',
      hello: 'world delegated',
    });
    angular.element($element).scope().$digest();

    window.setTimeout(() => {
      expect($element.html()).to.contain('world delegated');
      done();
    }, 100);
  });

  it('should support dispatch in container directive', () => {
    const containerDirFactory = connect({
      mapStateToScope: (getState) => ({
        hello: getState().hello,
      }),
      mapDispatchToScope: (dispatch, getState) => ({
        changeHello: () => {
          return dispatch({
            type: 'hello',
            hello: 'hello dispatch'
          });
        }
      }),
    }, testDirInteractDef);

    app.directive('testDir', containerDirFactory);
    // add reducer
    app.config(['ngStoreProvider', (provider) => {
      provider.setReducers((state, action) => {
        switch (action.type) {
          case 'hello':
            let nuState = state;
            nuState.hello = action.hello;
            return nuState;
          default:
            return state;
        }
      });
    }]);

    const $element = angularInject();
    expect($element.html()).not.to.contain('hello dispatch');

    $element.find('button')[0].click();
    expect($element.html()).to.contain('hello dispatch');
  });

});
