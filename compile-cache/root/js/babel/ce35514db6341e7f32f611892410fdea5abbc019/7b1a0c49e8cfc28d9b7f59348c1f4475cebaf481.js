Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _scriptInputView = require('./script-input-view');

var _scriptInputView2 = _interopRequireDefault(_scriptInputView);

'use babel';

var ScriptOptionsView = (function (_View) {
  _inherits(ScriptOptionsView, _View);

  function ScriptOptionsView() {
    _classCallCheck(this, ScriptOptionsView);

    _get(Object.getPrototypeOf(ScriptOptionsView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ScriptOptionsView, [{
    key: 'initialize',
    value: function initialize(runOptions) {
      var _this = this;

      this.runOptions = runOptions;
      this.emitter = new _atom.Emitter();

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': function coreCancel() {
          return _this.hide();
        },
        'core:close': function coreClose() {
          return _this.hide();
        },
        'script:close-options': function scriptCloseOptions() {
          return _this.hide();
        },
        'script:run-options': function scriptRunOptions() {
          return _this.panel.isVisible() ? _this.hide() : _this.show();
        },
        'script:save-options': function scriptSaveOptions() {
          return _this.saveOptions();
        }
      }));

      // handling focus traversal and run on enter
      this.find('atom-text-editor').on('keydown', function (e) {
        if (e.keyCode !== 9 && e.keyCode !== 13) return true;

        switch (e.keyCode) {
          case 9:
            {
              e.preventDefault();
              e.stopPropagation();
              var row = _this.find(e.target).parents('tr:first').nextAll('tr:first');
              if (row.length) {
                return row.find('atom-text-editor').focus();
              }
              return _this.buttonCancel.focus();
            }
          case 13:
            return _this.run();
        }
        return null;
      });

      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.hide();
    }
  }, {
    key: 'getOptions',
    value: function getOptions() {
      return {
        workingDirectory: this.inputCwd.get(0).getModel().getText(),
        cmd: this.inputCommand.get(0).getModel().getText(),
        cmdArgs: this.constructor.splitArgs(this.inputCommandArgs.get(0).getModel().getText()),
        env: this.inputEnv.get(0).getModel().getText(),
        scriptArgs: this.constructor.splitArgs(this.inputScriptArgs.get(0).getModel().getText())
      };
    }
  }, {
    key: 'saveOptions',
    value: function saveOptions() {
      var options = this.getOptions();
      for (var option in options) {
        var value = options[option];
        this.runOptions[option] = value;
      }
    }
  }, {
    key: 'onProfileSave',
    value: function onProfileSave(callback) {
      return this.emitter.on('on-profile-save', callback);
    }

    // Saves specified options as new profile
  }, {
    key: 'saveProfile',
    value: function saveProfile() {
      var _this2 = this;

      this.hide();

      var options = this.getOptions();

      var inputView = new _scriptInputView2['default']({ caption: 'Enter profile name:' });
      inputView.onCancel(function () {
        return _this2.show();
      });
      inputView.onConfirm(function (profileName) {
        if (!profileName) return;
        _underscore2['default'].forEach(_this2.find('atom-text-editor'), function (editor) {
          editor.getModel().setText('');
        });

        // clean up the options
        _this2.saveOptions();

        // add to global profiles list
        _this2.emitter.emit('on-profile-save', { name: profileName, options: options });
      });

      inputView.show();
    }
  }, {
    key: 'close',
    value: function close() {
      this.hide();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel.show();
      this.inputCwd.focus();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'run',
    value: function run() {
      this.saveOptions();
      this.hide();
      atom.commands.dispatch(this.getWorkspaceView(), 'script:run');
    }
  }, {
    key: 'getWorkspaceView',
    value: function getWorkspaceView() {
      return atom.views.getView(atom.workspace);
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ 'class': 'options-view' }, function () {
        _this3.h4({ 'class': 'modal-header' }, 'Configure Run Options');
        _this3.div({ 'class': 'modal-body' }, function () {
          _this3.table(function () {
            _this3.tr(function () {
              _this3.td({ 'class': 'first' }, function () {
                return _this3.label('Current Working Directory:');
              });
              _this3.td({ 'class': 'second' }, function () {
                return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCwd' });
              });
            });
            _this3.tr(function () {
              _this3.td(function () {
                return _this3.label('Command');
              });
              _this3.td(function () {
                return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCommand' });
              });
            });
            _this3.tr(function () {
              _this3.td(function () {
                return _this3.label('Command Arguments:');
              });
              _this3.td(function () {
                return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCommandArgs' });
              });
            });
            _this3.tr(function () {
              _this3.td(function () {
                return _this3.label('Program Arguments:');
              });
              _this3.td(function () {
                return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputScriptArgs' });
              });
            });
            _this3.tr(function () {
              _this3.td(function () {
                return _this3.label('Environment Variables:');
              });
              _this3.td(function () {
                return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputEnv' });
              });
            });
          });
        });
        _this3.div({ 'class': 'modal-footer' }, function () {
          var css = 'btn inline-block-tight';
          _this3.button({ 'class': 'btn ' + css + ' cancel', outlet: 'buttonCancel', click: 'close' }, function () {
            return _this3.span({ 'class': 'icon icon-x' }, 'Cancel');
          });
          _this3.span({ 'class': 'pull-right' }, function () {
            _this3.button({ 'class': 'btn ' + css + ' save-profile', outlet: 'buttonSaveProfile', click: 'saveProfile' }, function () {
              return _this3.span({ 'class': 'icon icon-file-text' }, 'Save as profile');
            });
            _this3.button({ 'class': 'btn ' + css + ' run', outlet: 'buttonRun', click: 'run' }, function () {
              return _this3.span({ 'class': 'icon icon-playback-play' }, 'Run');
            });
          });
        });
      });
    }
  }, {
    key: 'splitArgs',
    value: function splitArgs(argText) {
      var text = argText.trim();
      var argSubstringRegex = /([^'"\s]+)|((["'])(.*?)\3)/g;
      var args = [];
      var lastMatchEndPosition = -1;
      var match = argSubstringRegex.exec(text);
      while (match !== null) {
        var matchWithoutQuotes = match[1] || match[4];
        // Combine current result with last match, if last match ended where this
        // one begins.
        if (lastMatchEndPosition === match.index) {
          args[args.length - 1] += matchWithoutQuotes;
        } else {
          args.push(matchWithoutQuotes);
        }

        lastMatchEndPosition = argSubstringRegex.lastIndex;
        match = argSubstringRegex.exec(text);
      }
      return args;
    }
  }]);

  return ScriptOptionsView;
})(_atomSpacePenViews.View);

exports['default'] = ScriptOptionsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ZlbGlwZS8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC1vcHRpb25zLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRTZDLE1BQU07O2lDQUM5QixzQkFBc0I7OzBCQUM3QixZQUFZOzs7OytCQUNFLHFCQUFxQjs7OztBQUxqRCxXQUFXLENBQUM7O0lBT1MsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBOEMxQixvQkFBQyxVQUFVLEVBQUU7OztBQUNyQixVQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM3QixVQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7O0FBRTdCLFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQscUJBQWEsRUFBRTtpQkFBTSxNQUFLLElBQUksRUFBRTtTQUFBO0FBQ2hDLG9CQUFZLEVBQUU7aUJBQU0sTUFBSyxJQUFJLEVBQUU7U0FBQTtBQUMvQiw4QkFBc0IsRUFBRTtpQkFBTSxNQUFLLElBQUksRUFBRTtTQUFBO0FBQ3pDLDRCQUFvQixFQUFFO2lCQUFPLE1BQUssS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLE1BQUssSUFBSSxFQUFFLEdBQUcsTUFBSyxJQUFJLEVBQUU7U0FBQztBQUNoRiw2QkFBcUIsRUFBRTtpQkFBTSxNQUFLLFdBQVcsRUFBRTtTQUFBO09BQ2hELENBQUMsQ0FBQyxDQUFDOzs7QUFHSixVQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFDLENBQUMsRUFBSztBQUNqRCxZQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUss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a0JBQWtCLENBQUMsQ0FBQztTQUMvQjs7QUFFRCw0QkFBb0IsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7QUFDbkQsYUFBSyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0QztBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQXRHa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiIvaG9tZS9mZWxpcGUvLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQtb3B0aW9ucy12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBTY3JpcHRJbnB1dFZpZXcgZnJvbSAnLi9zY3JpcHQtaW5wdXQtdmlldyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdE9wdGlvbnNWaWV3IGV4dGVuZHMgVmlldyB7XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhpcy5kaXYoeyBjbGFzczogJ29wdGlvbnMtdmlldycgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5oNCh7IGNsYXNzOiAnbW9kYWwtaGVhZGVyJyB9LCAnQ29uZmlndXJlIFJ1biBPcHRpb25zJyk7XG4gICAgICB0aGlzLmRpdih7IGNsYXNzOiAnbW9kYWwtYm9keScgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLnRhYmxlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudGQoeyBjbGFzczogJ2ZpcnN0JyB9LCAoKSA9PiB0aGlzLmxhYmVsKCdDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5OicpKTtcbiAgICAgICAgICAgIHRoaXMudGQoeyBjbGFzczogJ3NlY29uZCcgfSwgKCkgPT4gdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJywgb3V0bGV0OiAnaW5wdXRDd2QnIH0pKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnRyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy5sYWJlbCgnQ29tbWFuZCcpKTtcbiAgICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJywgb3V0bGV0OiAnaW5wdXRDb21tYW5kJyB9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy50cigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMubGFiZWwoJ0NvbW1hbmQgQXJndW1lbnRzOicpKTtcbiAgICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJywgb3V0bGV0OiAnaW5wdXRDb21tYW5kQXJncycgfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMudHIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLmxhYmVsKCdQcm9ncmFtIEFyZ3VtZW50czonKSk7XG4gICAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMudGFnKCdhdG9tLXRleHQtZWRpdG9yJywgeyBtaW5pOiAnJywgY2xhc3M6ICdlZGl0b3IgbWluaScsIG91dGxldDogJ2lucHV0U2NyaXB0QXJncycgfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMudHIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLmxhYmVsKCdFbnZpcm9ubWVudCBWYXJpYWJsZXM6JykpO1xuICAgICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLnRhZygnYXRvbS10ZXh0LWVkaXRvcicsIHsgbWluaTogJycsIGNsYXNzOiAnZWRpdG9yIG1pbmknLCBvdXRsZXQ6ICdpbnB1dEVudicgfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ21vZGFsLWZvb3RlcicgfSwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjc3MgPSAnYnRuIGlubGluZS1ibG9jay10aWdodCc7XG4gICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6IGBidG4gJHtjc3N9IGNhbmNlbGAsIG91dGxldDogJ2J1dHRvbkNhbmNlbCcsIGNsaWNrOiAnY2xvc2UnIH0sICgpID0+XG4gICAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24teCcgfSwgJ0NhbmNlbCcpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ3B1bGwtcmlnaHQnIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiBgYnRuICR7Y3NzfSBzYXZlLXByb2ZpbGVgLCBvdXRsZXQ6ICdidXR0b25TYXZlUHJvZmlsZScsIGNsaWNrOiAnc2F2ZVByb2ZpbGUnIH0sICgpID0+XG4gICAgICAgICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ2ljb24gaWNvbi1maWxlLXRleHQnIH0sICdTYXZlIGFzIHByb2ZpbGUnKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6IGBidG4gJHtjc3N9IHJ1bmAsIG91dGxldDogJ2J1dHRvblJ1bicsIGNsaWNrOiAncnVuJyB9LCAoKSA9PlxuICAgICAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24tcGxheWJhY2stcGxheScgfSwgJ1J1bicpLFxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKHJ1bk9wdGlvbnMpIHtcbiAgICB0aGlzLnJ1bk9wdGlvbnMgPSBydW5PcHRpb25zO1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICAnY29yZTpjbG9zZSc6ICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgJ3NjcmlwdDpjbG9zZS1vcHRpb25zJzogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICAnc2NyaXB0OnJ1bi1vcHRpb25zJzogKCkgPT4gKHRoaXMucGFuZWwuaXNWaXNpYmxlKCkgPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdygpKSxcbiAgICAgICdzY3JpcHQ6c2F2ZS1vcHRpb25zJzogKCkgPT4gdGhpcy5zYXZlT3B0aW9ucygpLFxuICAgIH0pKTtcblxuICAgIC8vIGhhbmRsaW5nIGZvY3VzIHRyYXZlcnNhbCBhbmQgcnVuIG9uIGVudGVyXG4gICAgdGhpcy5maW5kKCdhdG9tLXRleHQtZWRpdG9yJykub24oJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSAhPT0gOSAmJiBlLmtleUNvZGUgIT09IDEzKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSA5OiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5maW5kKGUudGFyZ2V0KS5wYXJlbnRzKCd0cjpmaXJzdCcpLm5leHRBbGwoJ3RyOmZpcnN0Jyk7XG4gICAgICAgICAgaWYgKHJvdy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByb3cuZmluZCgnYXRvbS10ZXh0LWVkaXRvcicpLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbkNhbmNlbC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMTM6IHJldHVybiB0aGlzLnJ1bigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSk7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gIH1cblxuICBzdGF0aWMgc3BsaXRBcmdzKGFyZ1RleHQpIHtcbiAgICBjb25zdCB0ZXh0ID0gYXJnVGV4dC50cmltKCk7XG4gICAgY29uc3QgYXJnU3Vic3RyaW5nUmVnZXggPSAvKFteJ1wiXFxzXSspfCgoW1wiJ10pKC4qPylcXDMpL2c7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGxldCBsYXN0TWF0Y2hFbmRQb3NpdGlvbiA9IC0xO1xuICAgIGxldCBtYXRjaCA9IGFyZ1N1YnN0cmluZ1JlZ2V4LmV4ZWModGV4dCk7XG4gICAgd2hpbGUgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBtYXRjaFdpdGhvdXRRdW90ZXMgPSBtYXRjaFsxXSB8fCBtYXRjaFs0XTtcbiAgICAgIC8vIENvbWJpbmUgY3VycmVudCByZXN1bHQgd2l0aCBsYXN0IG1hdGNoLCBpZiBsYXN0IG1hdGNoIGVuZGVkIHdoZXJlIHRoaXNcbiAgICAgIC8vIG9uZSBiZWdpbnMuXG4gICAgICBpZiAobGFzdE1hdGNoRW5kUG9zaXRpb24gPT09IG1hdGNoLmluZGV4KSB7XG4gICAgICAgIGFyZ3NbYXJncy5sZW5ndGggLSAxXSArPSBtYXRjaFdpdGhvdXRRdW90ZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmdzLnB1c2gobWF0Y2hXaXRob3V0UXVvdGVzKTtcbiAgICAgIH1cblxuICAgICAgbGFzdE1hdGNoRW5kUG9zaXRpb24gPSBhcmdTdWJzdHJpbmdSZWdleC5sYXN0SW5kZXg7XG4gICAgICBtYXRjaCA9IGFyZ1N1YnN0cmluZ1JlZ2V4LmV4ZWModGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgZ2V0T3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd29ya2luZ0RpcmVjdG9yeTogdGhpcy5pbnB1dEN3ZC5nZXQoMCkuZ2V0TW9kZWwoKS5nZXRUZXh0KCksXG4gICAgICBjbWQ6IHRoaXMuaW5wdXRDb21tYW5kLmdldCgwKS5nZXRNb2RlbCgpLmdldFRleHQoKSxcbiAgICAgIGNtZEFyZ3M6IHRoaXMuY29uc3RydWN0b3Iuc3BsaXRBcmdzKFxuICAgICAgICB0aGlzLmlucHV0Q29tbWFuZEFyZ3MuZ2V0KDApLmdldE1vZGVsKCkuZ2V0VGV4dCgpLFxuICAgICAgKSxcbiAgICAgIGVudjogdGhpcy5pbnB1dEVudi5nZXQoMCkuZ2V0TW9kZWwoKS5nZXRUZXh0KCksXG4gICAgICBzY3JpcHRBcmdzOiB0aGlzLmNvbnN0cnVjdG9yLnNwbGl0QXJncyhcbiAgICAgICAgdGhpcy5pbnB1dFNjcmlwdEFyZ3MuZ2V0KDApLmdldE1vZGVsKCkuZ2V0VGV4dCgpLFxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgc2F2ZU9wdGlvbnMoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgIGZvciAoY29uc3Qgb3B0aW9uIGluIG9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgdGhpcy5ydW5PcHRpb25zW29wdGlvbl0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBvblByb2ZpbGVTYXZlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb24tcHJvZmlsZS1zYXZlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gU2F2ZXMgc3BlY2lmaWVkIG9wdGlvbnMgYXMgbmV3IHByb2ZpbGVcbiAgc2F2ZVByb2ZpbGUoKSB7XG4gICAgdGhpcy5oaWRlKCk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cbiAgICBjb25zdCBpbnB1dFZpZXcgPSBuZXcgU2NyaXB0SW5wdXRWaWV3KHsgY2FwdGlvbjogJ0VudGVyIHByb2ZpbGUgbmFtZTonIH0pO1xuICAgIGlucHV0Vmlldy5vbkNhbmNlbCgoKSA9PiB0aGlzLnNob3coKSk7XG4gICAgaW5wdXRWaWV3Lm9uQ29uZmlybSgocHJvZmlsZU5hbWUpID0+IHtcbiAgICAgIGlmICghcHJvZmlsZU5hbWUpIHJldHVybjtcbiAgICAgIF8uZm9yRWFjaCh0aGlzLmZpbmQoJ2F0b20tdGV4dC1lZGl0b3InKSwgKGVkaXRvcikgPT4ge1xuICAgICAgICBlZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0KCcnKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBjbGVhbiB1cCB0aGUgb3B0aW9uc1xuICAgICAgdGhpcy5zYXZlT3B0aW9ucygpO1xuXG4gICAgICAvLyBhZGQgdG8gZ2xvYmFsIHByb2ZpbGVzIGxpc3RcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvbi1wcm9maWxlLXNhdmUnLCB7IG5hbWU6IHByb2ZpbGVOYW1lLCBvcHRpb25zIH0pO1xuICAgIH0pO1xuXG4gICAgaW5wdXRWaWV3LnNob3coKTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLmlucHV0Q3dkLmZvY3VzKCk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMucGFuZWwuaGlkZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIHRoaXMuc2F2ZU9wdGlvbnMoKTtcbiAgICB0aGlzLmhpZGUoKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRoaXMuZ2V0V29ya3NwYWNlVmlldygpLCAnc2NyaXB0OnJ1bicpO1xuICB9XG5cbiAgZ2V0V29ya3NwYWNlVmlldygpIHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgfVxufVxuIl19