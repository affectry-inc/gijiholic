// main.js

var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var marked = require('marked');
var Split = require('split.js');
var Menu = require('react-burger-menu').push;
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var Link = require('react-router').Link;
var hashHistory = require('react-router').hashHistory;
var browserHistory = require('react-router').browserHistory;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
});

var GijiHolic = React.createClass({
  getInitialState: function() {
    return {
      isDocListMenuOpen: false,
      code: '',
      title: '',
      text: ''
    };
  },

  componentWillMount: function() {
    list = this.fetchList();
    if (list === null || list.length == 0) {
      localStorage.setItem('doc.list', JSON.stringify([]));
      var title = 'Hello~!';
      var text = '# Welcome to GIJIHolic!\n\n### GIJIHolic is a markdown editor';
      this.createDoc(title, text);
    }
  },

  componentDidMount: function() {
    this.fetchLocal(this.props.params.code);
    Split(['.editor-wrapper', '.preview-wrapper'], {
      sizes: [50, 50],
      minSize: 200
    });
  },

  componentDidUpdate: function(prevProps, prevState) {
    this.saveLocal();
  },

  componentWillReceiveProps(props) {
    this.fetchLocal(props.params.code);
    this.setState({
      isDocListMenuOpen: false
    });
  },

  handleMenuOpen: function(e) {
    this.setState({
      isDocListMenuOpen: true
    });
  },

  handleMenuClose() {
    this.setState({
      isDocListMenuOpen: false
    });
  },

  handleTitleChange: function(e) {
    this.setState({
      title: e.target.value
    });
  },

  handleGijiChange: function(e) {
    this.setState({
      text: e.target.value
    });
  },

  createDoc(title, text) {
    var code = new Date().getTime().toString(16).toUpperCase()
                 + Math.floor(1000*Math.random()).toString(16).toUpperCase();
    list = this.fetchList();
    list.push(code);
    localStorage.setItem('doc.list', JSON.stringify(list));
    localStorage.setItem('doc.' + code + '.title', title);
    localStorage.setItem('doc.' + code + '.text', text);
    return code;
  },

  /*
   * this.state -> localStorage
   */
  saveLocal: function() {
    localStorage.setItem('doc.' + this.state.code + '.title', this.state.title);
    localStorage.setItem('doc.' + this.state.code + '.text', this.state.text);
  },

  /*
   * localStorade -> this.state
   */
  fetchLocal: function(_code) {
    var code = _code;
    var list = this.fetchList();
    if (!code) {
      code = list[0];
    } else if (code == 'new') {
      var text = '\n\n\n\n> Written with [GIJIHolic](https://gijiholic.herokuapp.com).';
      code = this.createDoc('', text);
      location.href = '#/giji/' + code;
    } else if (code && (list.indexOf(code) < 0)) {
      location.href = '/404';
    }
    this.setState({
      code: code,
      title: localStorage.getItem('doc.' + code + '.title'),
      text: localStorage.getItem('doc.' + code + '.text')
    });
  },

  fetchList() {
    return JSON.parse(localStorage.getItem('doc.list'));
  },

  render: function() {
    return (
      <div className="app">
        <DocListMenu
          isOpen={this.state.isDocListMenuOpen}
          onMenuClose={this.handleMenuClose}
        />
        <main id="page-wrap">
          <Header
            title={this.state.title}
            onChange={this.handleTitleChange}
            onClick={this.handleMenuOpen}
          />
          <div className="gijiholic-wrapper">
            <div className="gijiholic">
              <div className="editor-wrapper split">
                <GijiEditor
                  text={this.state.text}
                  onChange={this.handleGijiChange}
                />
              </div>
              <div className="preview-wrapper split">
                <GijiPreview
                  text={this.state.text}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
});

var DocListMenu = React.createClass({
  getInitialState: function() {
    return {
      codeList: []
    };
  },

  getDefaultProps: function() {
    return {
      pageWrapId: 'page-wrap',
      customCrossIcon: false,
      customBurgerIcon: false,
      isOpen: false
    };
  },

  _onStateChange: function(state) {
    if (state.isOpen) {
      this.setState({
        codeList: JSON.parse(localStorage.getItem('doc.list'))
      });
    } else {
      this.props.onMenuClose();
    }
  },

  render: function() {
    return (
      <Menu
        pageWrapId={this.props.pageWrapId}
        customBurgerIcon={this.props.customBurgerIcon}
        customCrossIcon={this.props.customCrossIcon}
        isOpen={this.props.isOpen}
        onStateChange={this._onStateChange}>
          <DocList codeList={this.state.codeList} />
      </Menu>
    );
  }
});

var MenuList = React.createClass({
  render: function() {
    return (
      <ul>
      </ul>
    );
  }
});

var DocList = React.createClass({
  render: function() {
    var docNodes = this.props.codeList.map(function(code) {
      var title = localStorage.getItem('doc.' + code + '.title');
      if (!title) {title = 'Untitled'}
      return (
        <li key={code}>
          <Link to={'/giji/'+code}>{title}</Link><br/>
        </li>
      );
    });
    return (
      <ul className="docList">
        {docNodes}
      </ul>
    );
  }
});

var Header = React.createClass({
  getInitialState: function() {
    return {title: ''};
  },

  _onChange(e) {
    this.props.onChange(e);
  },

  _onClick(e) {
    this.props.onClick(e);
  },

  render: function() {
    return (
      <header className="g-header">
        <h1>
          <a href="./">GIJIHolic</a>
        </h1>
        <div className="title-wrapper">
          <TitleEditor
            title={this.props.title}
            onChange={this._onChange}
          />
          <input type="button" value="GIJIs" onClick={this._onClick} />
        </div>
      </header>
    );
  }
});

var TitleEditor = React.createClass({
  getInitialState: function() {
    return {title: ''};
  },

  _onChange(e) {
    this.props.onChange(e);
  },

  render: function() {
    return (
      <input
        placeholder='Untitled'
        value={this.props.title}
        onChange={this._onChange}
      />
    );
  }
});

var GijiEditor = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },

  componentDidMount: function() {
    this.refs.textarea.focus();
  },

  _onChange(e) {
    this.props.onChange(e);
  },

  render: function() {
    return (
      <textarea
        ref="textarea"
        value={this.props.text}
        onChange={this._onChange}
      />
    );
  }
});

var GijiPreview = React.createClass({
  getDefaultProps() {
    return {
      text: ''
    };
  },

  render: function() {
    var markedText = marked(this.props.text);
    return (
      <div className="preview-content" dangerouslySetInnerHTML={{__html: markedText}}>
      </div>
    );
  }
});


var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url + 'find/',
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    $.ajax({
      url: this.props.url + 'insert',
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.loadCommentsFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} createdOn={comment.createdOn} key={comment._id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, createdOn: Date.now()});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    var createdOn = new Date();
    createdOn.setTime(this.props.createdOn);
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <p>{this.props.children}</p>
        <time className="commentCreatedOn">{createdOn.toUTCString()}</time>
      </div>
    );
  }
});

ReactDOM.render(
  //  <CommentBox url="./" />,
  // <GijiHolic url="./" />,
  (
    <Router history={hashHistory}>
      <Route path="/" component={GijiHolic} />
      <Route path="/giji/:code" component={GijiHolic} />
    </Router>
  ), document.getElementById('content')
);

