import {
  expect
} from 'chai';
import setup from '../src/setup';
import connect from '../src/connect';
import angular from 'angular';
import 'angular-mocks';

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

  beforeEach(() => {
    app = setup(angular.module('test', []));
  });

  it('should support mapStateToScope', () => {
    const wrappedDirDef = connect({
      mapStateToScope: () => ({
        hello: 'world',
      }),
      mapDispatchToScope: () => {},
    }, testDirDef);
    app.directive('dirTest', wrappedDirDef);

    angular.mock.module('test');
    angular.mock.inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
    const $nuScope = $rootScope.$new(true);
    const $element = $compile('<dir-test/>')($nuScope);
    $nuScope.$digest();
    expect($element.html()).to.contain('hello world');
  });
});
