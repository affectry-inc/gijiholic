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

const actionEdit = 'edit';
const actionView = 'view';
const actionDelete = 'delete';

var editorWidth = 0;
var previewWidth = 0;

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
      text: '',
      previewScrollRatio: 0
    };
  },

  componentWillMount: function() {
    if (this.fetchList() === null) {
      localStorage.setItem('doc.list', JSON.stringify([]));
    }
  },

  componentDidMount: function() {
    if (this.props.params.action == actionDelete) {
      this.removeDocLocal(this.props.params.code);
      location.href = '#';
    } else {
      this.fetchLocal(this.props.params.code);
    }
    Split(['.editor-wrapper', '.preview-wrapper'], {
      sizes: [50, 50],
      minSize: 200
    });
    editorWidth = $(".editor-wrapper").width();
    previewWidth = $(".preview-wrapper").width();
    this.toggleGutter(this.props.params.action);
  },

  componentWillReceiveProps(props) {
    if (props.params.action == actionDelete) {
      this.removeDocLocal(props.params.code);
      location.href = '#';
    } else {
      this.fetchLocal(props.params.code);
    }
    this.toggleGutter(props.params.action);
    this.setState({
      isDocListMenuOpen: false
    });
  },

  toggleGutter(action, split = true) {
    $(".editor-wrapper").removeClass("hide");
    $(".gutter").removeClass("hide");
    $(".preview-wrapper").removeClass("hide");
    $("#split-editor-toggle").addClass("hide");
    $("#full-editor-toggle").addClass("hide");
    if (action == actionView) {
      $(".editor-wrapper").addClass("hide");
      $(".gutter").addClass("hide");
      $(".preview-wrapper").width("100%");
    } else {
      if (split) {
        $(".editor-wrapper").width(editorWidth);
        $(".preview-wrapper").width(previewWidth);
        $("#full-editor-toggle").removeClass("hide");
      } else {
        $(".gutter").addClass("hide");
        $(".preview-wrapper").addClass("hide");
        $(".editor-wrapper").width("100%");
        $("#split-editor-toggle").removeClass("hide");
      }
    }
  },

  toggleSplitEditor() {
    this.toggleGutter(actionEdit, true);
  },

  toggleFullEditor() {
    this.toggleGutter(actionEdit, false);
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
    this.saveLocal(e.target.value, null);
  },

  handleGijiChange: function(e) {
    this.setState({
      text: e.target.value
    });
    this.saveLocal(null, e.target.value);
  },

  handleEditorScroll(e) {
    var editorScroll = e.target.scrollTop;
    var editorRange = e.target.scrollHeight - e.target.offsetHeight;
    var ratio = editorScroll / editorRange;
    var ele = this.refs.previewWrapper;
    var previewRange = ele.scrollHeight - ele.offsetHeight;
    var previewScroll = previewRange * ratio;
    ele.scrollTop = previewScroll;
  },

  handlePreviewScroll(e) {
    // var editorScroll = e.target.scrollTop;
    // var editorRange = e.target.scrollHeight - e.target.offsetHeight;
    // var ratio = editorScroll / editorRange;
    // this.setState({
    //   previewScrollRatio: ratio
    // });
  },

  /**
   * new data -> localStorage
   */
  createDocLocal(title, text) {
    var ust = "";
    for (i = 0; i < 9; i++) {
      random = Math.random() * 16 | 0;
      ust += (i == 4 ? (random & 3 | 8) : random).toString(16).toUpperCase();
    }
    var code = new Date().getTime().toString(16).toUpperCase() + ust;
    list = this.fetchList();
    list.push(code);
    localStorage.setItem('doc.list', JSON.stringify(list));
    localStorage.setItem('doc.' + code + '.title', title);
    localStorage.setItem('doc.' + code + '.text', text);
    localStorage.setItem('doc.' + code + '.new', true);
    return code;
  },

  /**
   * remove data from localStorage
   */
  removeDocLocal(code) {
    list = this.fetchList();
    list = list.filter(function(e){
      return e != code;
    });
    localStorage.setItem('doc.list', JSON.stringify(list));
    localStorage.removeItem('doc.' + code + '.title');
    localStorage.removeItem('doc.' + code + '.text');
    localStorage.removeItem('doc.' + code + '.new');
  },

  /**
   * this.state -> localStorage
   */
  saveLocal: function(title, text) {
    if (this.props.params.action == actionView){ return }
    if (title) {
      localStorage.setItem('doc.' + this.state.code + '.title', title);
    }
    if (text) {
      localStorage.setItem('doc.' + this.state.code + '.text', text);
    }
    localStorage.setItem('doc.' + this.state.code + '.new', false);
  },

  /**
   * localStorage -> this.state
   */
  fetchLocal: function(_code) {
    var code = _code;
    var list = this.fetchList();
    if (!code) {
      if (list.length == 0) {
        var title = 'Hello~!';
        var text = '# Welcome to GIJIHolic!\n\n### GIJIHolic is a markdown editor';
        code = this.createDocLocal(title, text);
      } else {
        var lastOpened = localStorage.getItem('doc.last-opened');
        code = (lastOpened && list.indexOf(lastOpened) >= 0) ? lastOpened : list[0];
      }
    } else if (code == 'new') {
      code = this.fetchNew();
      if (!code) {
        var text = '\n\n\n\n> Written with [GIJIHolic](https://gijiholic.herokuapp.com).';
        code = this.createDocLocal('', text);
      }
      location.href = '#/' + actionEdit + '/' + code;
    } else if ((list.indexOf(code) < 0)) {
      location.href = '/404';
    }
    localStorage.setItem('doc.last-opened', code);
    this.setState({
      code: code,
      title: localStorage.getItem('doc.' + code + '.title'),
      text: localStorage.getItem('doc.' + code + '.text')
    });
  },

  fetchNew() {
    list = this.fetchList();
    for (var i = 0; i < list.length; i++) {
      if (localStorage.getItem('doc.' + list[i] + '.new') == 'true') {
        return list[i];
      }
    };
    return null;
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
            code={this.state.code}
            onTitleChange={this.handleTitleChange}
            onMenuClick={this.handleMenuOpen}
          />
          <div className="gijiholic-wrapper">
            <div className="gijiholic">
              <div className="editor-wrapper split">
                <GijiEditor
                  text={this.state.text}
                  previewScrollRatio={this.state.previewScrollRatio}
                  onChange={this.handleGijiChange}
                  onScroll={this.handleEditorScroll}
                />
              </div>
              <input id="split-editor-toggle" type="button" value="<"
                className="toggle-btn offset-left"
                onClick={this.toggleSplitEditor}
              />
              <input id="full-editor-toggle" type="button" value=">"
                className="toggle-btn offset-right"
                onClick={this.toggleFullEditor}
              />
              <div
                ref="previewWrapper"
                className="preview-wrapper split"
                onScroll={this.handlePreviewScroll}>
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
          <Link to={'/'+actionEdit+'/'+code}>{title}</Link><br/>
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

  _onTitleChange(e) {
    this.props.onTitleChange(e);
  },

  _onMenuClick(e) {
    this.props.onMenuClick(e);
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
            onChange={this._onTitleChange}
          />
          <input type="button" value="GIJIs" onClick={this._onMenuClick} />
          <Link to={"/"+actionEdit+"/new"}>New Giji</Link>&nbsp;
          <Link to={"/"+actionEdit+"/"+this.props.code}>Edit</Link>&nbsp;
          <Link to={"/"+actionView+"/"+this.props.code}>View</Link>&nbsp;
          <Link to={"/"+actionDelete+"/"+this.props.code}>Delete</Link>
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

  componentWillReceiveProps(props) {
    var ele = this.refs.textarea;
    var editorRange = ele.scrollHeight - ele.offsetHeight;
    var editorScroll = editorRange * props.previewScrollRatio;
    ele.scrollTop = editorScroll;
  },

  _onChange(e) {
    this.props.onChange(e);
  },

  _onScroll(e) {
    this.props.onScroll(e);
  },

  render: function() {
    return (
      <textarea
        ref="textarea"
        value={this.props.text}
        onChange={this._onChange}
        onScroll={this._onScroll}
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
      <Route path={"/:action/:code"} component={GijiHolic} />
    </Router>
  ), document.getElementById('content')
);

