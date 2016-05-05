import {
    expect
} from 'chai';
import sinon from 'sinon';
import PropTypes from 'proptypes';

import setup from '../src/setup';
import angular from 'angular';
import 'angular-mocks';

describe('Angular app setup', () => {
  let app;
  let $compile;
  let $rootScope;

  function testDirDefWithoutPropTypes() {
    return {
      scope: {},
      link($scope) {
        return $scope;
      },
      template: '<div>hello {{hello}}</div>',
    };
  }

  function testDirDefWithPropTypesExisted() {
    return {
      _propTypes_: {},
      link($scope) {
        return $scope;
      },
      template: '<div>hello {{hello}}</div>',
    };
  }

  function testDirDefWithPropTypesDefined() {
    return {
      _propTypes_: {
        hello: PropTypes.string,
      },
      scope: {
        hello: '=',
      },
      link($scope) {
        return $scope;
      },
      template: '<div>hello {{hello}}</div>',
    };
  }

  function testDirDefWithDefaultProps() {
    return {
      _propTypes_: {
        hello: PropTypes.string,
      },
      _getDefaultProps_() {
        return {
          hello: 'world default',
        };
      },
      scope: {
        hello: '=',
      },
      link($scope) {
        return $scope;
      },
      template: '<div>hello {{hello}}</div>',

    }
  }

  let initInject = false;

  function _initInject() {
    angular.mock.module('test');
    angular.mock.inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
    initInject = true;
  }

  function angularInject(html = '<test-dir/>') {
    !initInject && _initInject();

    const $nuScope = $rootScope.$new(true);
    const $element = $compile(html)($nuScope);
    $nuScope.$digest();
    return $element;
  }


  beforeEach(() => {
    app = angular.module('test', []);
  });
  afterEach(() => {
    initInject = false;
  })

  it('should setup correctly', () => {
    app = setup(app);
    angular.mock.module('test');
    expect(1).to.equal(1, 'no exception alone the way');
  });

  it('should should allow initial state', (done) => {

    app = setup(app);
    app.config(['ngStoreProvider', ngStore => {
      ngStore.setInitialState({
        hello: 'world'
      });
      ngStore.setReducers(state => {
        state.hello = state.hello + ' > ' + (new Date());
        return state;
      });
    }]);
    app.run(['ngStore', store => {
      expect(store.getState().hello).to.contain('world');
      done();
    }]);
    angularInject();
  });

  it('should warn directive without propTypes', () => {
    const warning = sinon.spy(console, 'warn');
    app = setup(app);
    app.directive('testDir', testDirDefWithoutPropTypes);

    angularInject();

    expect(warning.called).to.be.true;
    warning.restore();
  });

  it('should NOT warn directive with propTypes suggested', () => {
    const warning = sinon.spy(console, 'warn');
    app = setup(app);
    app.directive('testDir', testDirDefWithPropTypesExisted);

    angularInject();

    expect(warning.called).to.be.false;
    warning.restore();
  });

  it('should check directive propTypes', () => {
    const warning = sinon.spy(console, 'warn');
    app = setup(app);
    app.directive('testDir', testDirDefWithPropTypesDefined);

    expect(angularInject.bind(null, '<test-dir hello="1"/>')).to.throw(Error);
    expect(warning.called).to.be.true;

    expect(angularInject.bind(null, '<test-dir hello="world"/>')).not.to.throw(Error);
    warning.restore();
  });

  it('should support directive with defaultProps', () => {
    app = setup(app);
    app.directive('testDir', testDirDefWithDefaultProps);
    const $el = angularInject();
    expect($el.html()).to.contain('hello world default');
  });
});
