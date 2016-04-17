# a1-redux
Angular 1.x with redux the right way.

### TODO
- [x] add unit test on browser.
- [x] support register library with propTypes checking.
- [ ] unit test for store.register and handle action.
- [ ] container directive

## How to use the library? Where is the document?
For now, please check the unit test in the `test` directory.

## Container directive

** The goal is separating between the presentation and the state/logic control. **

Potential setup
```javascript
app.directive('directiveUI', () => ({link: () => {}, template: '<div>ui directive</div>'}));
app.directive('directiveContainerUI', connect({mapStateToScope, mapDispatchToScope}, () => ({template: '<directiveUI />'})));
```
Is it too cumbersome? and duplicated?

### OR we can do the following:

Start with presentation:  file `directive-present.js`:
```javascript
export default const directiveFactory = ['$service1', '$service2', ($service1, $service2) => {
  return {
    _propTypes_: {
      hello: PropTypes.string,
    },
    link: ($scope, $element, $attrs) {
      // link implementation...
    },
    template: '<div>present directive {{hello}}</div>',
  };
}];
```

Then the container: file `directive-container.js`
```javascript
import directivePresent from './directive-present';
import actions from './actions';
import {connect} from 'a1-redux';

const mapStateToScope = (getState) => ({
  attr1: () => getState().attr1,
  attr2: () => getState().attr2,
});

const mapDispatchToScope = (dispatch, getState) => ({
  dispatch1: (var1, var2) =>  dispatch(actions.forDispatch1({var1, var2})),
})

export default connect({mapStateToScope, mapDispatchToScope}, directivePresent);
```

Then put in the application: file `app.js`
```javascript
import {setup} from 'a1-redux';
import directiveABC from './directive-container';


let app = setup(angular.module('myapp', []));
app.directive('directiveABC', directiveABC);
//... more ...
```
