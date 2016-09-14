// main.js

var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var marked = require('marked');
var Split = require('split.js')
var Menu = require('react-burger-menu').push

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
});

var GijiHolic = React.createClass({
  getInitialState: function() {
    return {
      title: '',
      text: ''
    };
  },

  componentWillMount: function() {
    var title = 'Title';
    var text = '# GIJIHolic\n\nis markdown editor';
    if (localStorage.getItem('giji') === null) {
      localStorage.setItem('giji', JSON.stringify({title: title, text: text}));
    }
  },

  componentDidMount: function() {
    data = this.fetchLocal()
    this.setState({
      title: data.title,
      text: data.text
    });
    Split(['.editor-wrapper', '.preview-wrapper'], {
      sizes: [50, 50],
      minSize: 200
    });
  },

  componentDidUpdate: function(prevProps, prevState) {
    this.saveLocal();
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

  saveLocal: function() {
    localStorage.setItem('giji', JSON.stringify(this.state));
  },

  fetchLocal: function() {
    return JSON.parse(localStorage.getItem('giji'));
  },

  render: function() {
    return (
      <div className="app">
        <Menu pageWrapId={"page-wrap"}>
          <a id="home" className="menu-item" href="/">Home</a>
        </Menu>
        <main id="page-wrap">
          <Header
            title={this.state.title}
            onChange={this.handleTitleChange}
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

var Header = React.createClass({
  getInitialState: function() {
    return {title: ''};
  },

  _onChange(e) {
    this.props.onChange(e);
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
  <GijiHolic url="./" />,
  document.getElementById('content')
);

