---
title: Using React the ES5 and ES6 Way
date: 2016-09-24 14:54:19
tags:
  - tutorial
  - JavaScript
  - React
  - ES5
  - ES6
---

There are two ways to use React, the old `createClass` or the fancy ES6 `extend` way. We should go the ES6 way since it gives much more native JavaScript feeling rather than react feeling when you coding. But there are so much examples out there which follows the classic way. It is good to give a look to both of them side by side to provide a more clear understanding. Yes, you can apply ES6 syntax to `createClass` as well, but we won't cover that here.

<!--more-->

## Declare a new component:
```JavaScript
//ES5
var MyComponent = React.createClass({
  render: function() {
      return <h1>hello {this.props.name}</h1>
  }
});
```

```JavaScript
//ES6
class MyComponent extends React.Component {
  render() {
    return <h1>hello {this.props.name}</h1>;
  }
}
```
There is a fancy introduced in 1.4 with the concept of "stateless component". Many benefits will gain via this way, but this is not the topic here.
```JavaScript
//ES6, stateless functional component
const MyComponent = props => {
    return <h1>hello {props.name}</h1>;
}
```

## props and state gets better
`props` with the ES6 take advantage of the new syntax, makes it more JavaScript-favor, it's now more like a built-in property of a class rather than some return value from a function.
```JavaScript
//ES5
var MyComponent = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
    },

    getDefaultProps: function() {
        return {
            name: 'albert',
        };
    },

    getInitialState: function() {
        return {};
    },

    render: function(){
        return <h1>hellow {this.props.name}</h1>
    },
});
```

```JavaScript
//ES6
class MyComponent extends React.Component {
    static propTypes = {
        name: React.PropTypes.string.isRequired,    
    }

    static defaultProps = {
        name: 'albert',
    }

    state = {
    }

    render(){
        return <h1>hello {this.props.name}</h1>;
    }
}
```

```JavaScript
//Another way via ES6
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
        <div>hello {this.props.name}</div>
        );
    }
}

MyComponent.propTypes = {
    name: React.PropTypes.string.isRequired,    
};

MyComponent.defaultProps = {
    name: 'albert',    
};
```

## context may a little bit different
In fact, this section has nothing to do with the syntax, it is something about the `createClass`. It will auto-bind the `this`, but we need to manage this via ES6.
```JavaScript
//ES5
var MyComponent = React.createClass({
    clickMe: function(){
        console.log(this);
    },

    render: function(){
        return <div onClick={this.clickMe}></div>
    },
});

```
We have multiple ways to do this via ES6.
```JavaScript
//ES6
class MyComponent extends React.Component {
    clickMe(){
        console.log(this);
    }

    render(){
        return <div onClick={this.clickMe.bind(this)}></div>
    }
}
```

```JavaScript
//ES6 bind this in the constructor
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.clickMe = this.clickMe.bind(this);
    }

    clickMe(){
        console.log(this);
    }

    render(){
        return <div onClick={this.clickMe}></div>
    }
}
```
Now my personal favourite, the truely ES6 approach via `arrow function`.
And isn't this the most usage of arrow function?
```JavaScript
//ES6 with arrow function
class MyComponent extends React.Component {
    clickMe = (e) => {
        console.log(this);
    }

    render(){
        return <div onClick={this.clickMe}></div>
    }
}
```
It works simply because arrow functions can use the same lexical scope as the codes around it.

## End of story
React is fun to use. Hope it helps some one. You can see by the above examples that when you use the ES6 syntax, most of the time, you are dealing with the JavaScript syntax itself rather than learning some react built-in functions. Which feels super good.