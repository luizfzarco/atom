Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.shouldTriggerLinter = shouldTriggerLinter;
exports.getEditorCursorScopes = getEditorCursorScopes;
exports.isPathIgnored = isPathIgnored;
exports.subscriptiveObserve = subscriptiveObserve;
exports.messageKey = messageKey;
exports.normalizeMessages = normalizeMessages;
exports.messageKeyLegacy = messageKeyLegacy;
exports.normalizeMessagesLegacy = normalizeMessagesLegacy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var _atom = require('atom');

var $version = '__$sb_linter_version';
exports.$version = $version;
var $activated = '__$sb_linter_activated';
exports.$activated = $activated;
var $requestLatest = '__$sb_linter_request_latest';
exports.$requestLatest = $requestLatest;
var $requestLastReceived = '__$sb_linter_request_last_received';

exports.$requestLastReceived = $requestLastReceived;

function shouldTriggerLinter(linter, wasTriggeredOnChange, scopes) {
  if (wasTriggeredOnChange && !(linter[$version] === 2 ? linter.lintsOnChange : linter.lintOnFly)) {
    return false;
  }
  return scopes.some(function (scope) {
    return linter.grammarScopes.includes(scope);
  });
}

function getEditorCursorScopes(textEditor) {
  return (0, _lodashUniq2['default'])(textEditor.getCursors().reduce(function (scopes, cursor) {
    return scopes.concat(cursor.getScopeDescriptor().getScopesArray());
  }, ['*']));
}

function isPathIgnored(filePath, ignoredGlob, ignoredVCS) {
  if (ignoredVCS) {
    var repository = null;
    var projectPaths = atom.project.getPaths();
    for (var i = 0, _length2 = projectPaths.length; i < _length2; ++i) {
      var projectPath = projectPaths[i];
      if (filePath.indexOf(projectPath) === 0) {
        repository = atom.project.getRepositories()[i];
        break;
      }
    }
    if (repository && repository.isPathIgnored(filePath)) {
      return true;
    }
  }
  var normalizedFilePath = process.platform === 'win32' ? filePath.replace(/\\/g, '/') : filePath;
  return (0, _minimatch2['default'])(normalizedFilePath, ignoredGlob);
}

function subscriptiveObserve(object, eventName, callback) {
  var subscription = null;
  var eventSubscription = object.observe(eventName, function (props) {
    if (subscription) {
      subscription.dispose();
    }
    subscription = callback.call(this, props);
  });

  return new _atom.Disposable(function () {
    eventSubscription.dispose();
    if (subscription) {
      subscription.dispose();
    }
  });
}

function messageKey(message) {
  var reference = message.reference;
  return ['$LINTER:' + message.linterName, '$LOCATION:' + message.location.file + '$' + message.location.position.start.row + '$' + message.location.position.start.column + '$' + message.location.position.end.row + '$' + message.location.position.end.column, reference ? '$REFERENCE:' + reference.file + '$' + (reference.position ? reference.position.row + '$' + reference.position.column : '') : '$REFERENCE:null', '$EXCERPT:' + message.excerpt, '$SEVERITY:' + message.severity, message.icon ? '$ICON:' + message.icon : '$ICON:null', message.url ? '$URL:' + message.url : '$URL:null'].join('');
}

function normalizeMessages(linterName, messages) {
  for (var i = 0, _length3 = messages.length; i < _length3; ++i) {
    var message = messages[i];
    var reference = message.reference;
    if (Array.isArray(message.location.position)) {
      message.location.position = _atom.Range.fromObject(message.location.position);
    }
    if (reference && Array.isArray(reference.position)) {
      reference.position = _atom.Point.fromObject(reference.position);
    }
    if (message.solutions && message.solutions.length) {
      for (var j = 0, _length = message.solutions.length, solution = undefined; j < _length; j++) {
        solution = message.solutions[j];
        if (Array.isArray(solution.position)) {
          solution.position = _atom.Range.fromObject(solution.position);
        }
      }
    }
    message.version = 2;
    if (!message.linterName) {
      message.linterName = linterName;
    }
    message.key = messageKey(message);
  }
}

function messageKeyLegacy(message) {
  return ['$LINTER:' + message.linterName, '$LOCATION:' + (message.filePath || '') + '$' + (message.range ? message.range.start.row + '$' + message.range.start.column + '$' + message.range.end.row + '$' + message.range.end.column : ''), '$TEXT:' + (message.text || ''), '$HTML:' + (message.html || ''), '$SEVERITY:' + message.severity, '$TYPE:' + message.type, '$CLASS:' + (message['class'] || '')].join('');
}

function normalizeMessagesLegacy(linterName, messages) {
  for (var i = 0, _length4 = messages.length; i < _length4; ++i) {
    var message = messages[i];
    var fix = message.fix;
    if (message.range && message.range.constructor.name === 'Array') {
      message.range = _atom.Range.fromObject(message.range);
    }
    if (fix && fix.range.constructor.name === 'Array') {
      fix.range = _atom.Range.fromObject(fix.range);
    }
    if (!message.severity) {
      var type = message.type.toLowerCase();
      if (type === 'warning') {
        message.severity = type;
      } else if (type === 'info' || type === 'trace') {
        message.severity = 'info';
      } else {
        message.severity = 'error';
      }
    }
    message.version = 1;
    message.linterName = linterName;
    message.key = messageKeyLegacy(message);

    if (message.trace) {
      normalizeMessagesLegacy(linterName, message.trace);
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ZlbGlwZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7eUJBRXNCLFdBQVc7Ozs7MEJBQ1QsYUFBYTs7OztvQkFDSSxNQUFNOztBQUl4QyxJQUFNLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQTs7QUFDdkMsSUFBTSxVQUFVLEdBQUcsd0JBQXdCLENBQUE7O0FBQzNDLElBQU0sY0FBYyxHQUFHLDZCQUE2QixDQUFBOztBQUNwRCxJQUFNLG9CQUFvQixHQUFHLG9DQUFvQyxDQUFBOzs7O0FBRWpFLFNBQVMsbUJBQW1CLENBQ2pDLE1BQWMsRUFDZCxvQkFBNkIsRUFDN0IsTUFBcUIsRUFDWjtBQUNULE1BQUksb0JBQW9CLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQSxBQUFDLEVBQUU7QUFDL0YsV0FBTyxLQUFLLENBQUE7R0FDYjtBQUNELFNBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFTLEtBQUssRUFBRTtBQUNqQyxXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQzVDLENBQUMsQ0FBQTtDQUNIOztBQUVNLFNBQVMscUJBQXFCLENBQUMsVUFBc0IsRUFBaUI7QUFDM0UsU0FBTyw2QkFBWSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLE1BQU07V0FDL0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztHQUM1RCxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQ1g7O0FBRU0sU0FBUyxhQUFhLENBQUMsUUFBZ0IsRUFBRSxXQUFtQixFQUFFLFVBQW1CLEVBQVc7QUFDakcsTUFBSSxV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LENBQUMsS0FBSyxHQUFHLFlBQU0sVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNoRDtBQUNELFFBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDakQsU0FBRyxDQUFDLEtBQUssR0FBRyxZQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDeEM7QUFDRCxRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUNyQixVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ3ZDLFVBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixlQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtPQUN4QixNQUFNLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQzlDLGVBQU8sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFBO09BQzFCLE1BQU07QUFDTCxlQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtPQUMzQjtLQUNGO0FBQ0QsV0FBTyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDbkIsV0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDL0IsV0FBTyxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTs7QUFFdkMsUUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2pCLDZCQUF1QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDbkQ7R0FDRjtDQUNGIiwiZmlsZSI6Ii9ob21lL2ZlbGlwZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgbWluaW1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCBhcnJheVVuaXF1ZSBmcm9tICdsb2Rhc2gudW5pcSdcbmltcG9ydCB7IERpc3Bvc2FibGUsIFJhbmdlLCBQb2ludCB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXIsIE1lc3NhZ2UsIE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgJHZlcnNpb24gPSAnX18kc2JfbGludGVyX3ZlcnNpb24nXG5leHBvcnQgY29uc3QgJGFjdGl2YXRlZCA9ICdfXyRzYl9saW50ZXJfYWN0aXZhdGVkJ1xuZXhwb3J0IGNvbnN0ICRyZXF1ZXN0TGF0ZXN0ID0gJ19fJHNiX2xpbnRlcl9yZXF1ZXN0X2xhdGVzdCdcbmV4cG9ydCBjb25zdCAkcmVxdWVzdExhc3RSZWNlaXZlZCA9ICdfXyRzYl9saW50ZXJfcmVxdWVzdF9sYXN0X3JlY2VpdmVkJ1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkVHJpZ2dlckxpbnRlcihcbiAgbGludGVyOiBMaW50ZXIsXG4gIHdhc1RyaWdnZXJlZE9uQ2hhbmdlOiBib29sZWFuLFxuICBzY29wZXM6IEFycmF5PHN0cmluZz4sXG4pOiBib29sZWFuIHtcbiAgaWYgKHdhc1RyaWdnZXJlZE9uQ2hhbmdlICYmICEobGludGVyWyR2ZXJzaW9uXSA9PT0gMiA/IGxpbnRlci5saW50c09uQ2hhbmdlIDogbGludGVyLmxpbnRPbkZseSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gc2NvcGVzLnNvbWUoZnVuY3Rpb24oc2NvcGUpIHtcbiAgICByZXR1cm4gbGludGVyLmdyYW1tYXJTY29wZXMuaW5jbHVkZXMoc2NvcGUpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFZGl0b3JDdXJzb3JTY29wZXModGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IEFycmF5PHN0cmluZz4ge1xuICByZXR1cm4gYXJyYXlVbmlxdWUodGV4dEVkaXRvci5nZXRDdXJzb3JzKCkucmVkdWNlKChzY29wZXMsIGN1cnNvcikgPT4gKFxuICAgIHNjb3Blcy5jb25jYXQoY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KCkpXG4gICksIFsnKiddKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGF0aElnbm9yZWQoZmlsZVBhdGg6IHN0cmluZywgaWdub3JlZEdsb2I6IHN0cmluZywgaWdub3JlZFZDUzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBpZiAoaWdub3JlZFZDUykge1xuICAgIGxldCByZXBvc2l0b3J5ID0gbnVsbFxuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHByb2plY3RQYXRocy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgcHJvamVjdFBhdGggPSBwcm9qZWN0UGF0aHNbaV1cbiAgICAgIGlmIChmaWxlUGF0aC5pbmRleE9mKHByb2plY3RQYXRoKSA9PT0gMCkge1xuICAgICAgICByZXBvc2l0b3J5ID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpW2ldXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXBvc2l0b3J5ICYmIHJlcG9zaXRvcnkuaXNQYXRoSWdub3JlZChmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGNvbnN0IG5vcm1hbGl6ZWRGaWxlUGF0aCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyBmaWxlUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJykgOiBmaWxlUGF0aFxuICByZXR1cm4gbWluaW1hdGNoKG5vcm1hbGl6ZWRGaWxlUGF0aCwgaWdub3JlZEdsb2IpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpcHRpdmVPYnNlcnZlKG9iamVjdDogT2JqZWN0LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gIGxldCBzdWJzY3JpcHRpb24gPSBudWxsXG4gIGNvbnN0IGV2ZW50U3Vic2NyaXB0aW9uID0gb2JqZWN0Lm9ic2VydmUoZXZlbnROYW1lLCBmdW5jdGlvbihwcm9wcykge1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICB9XG4gICAgc3Vic2NyaXB0aW9uID0gY2FsbGJhY2suY2FsbCh0aGlzLCBwcm9wcylcbiAgfSlcblxuICByZXR1cm4gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgZXZlbnRTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VLZXkobWVzc2FnZTogTWVzc2FnZSkge1xuICBjb25zdCByZWZlcmVuY2UgPSBtZXNzYWdlLnJlZmVyZW5jZVxuICByZXR1cm4gW1xuICAgIGAkTElOVEVSOiR7bWVzc2FnZS5saW50ZXJOYW1lfWAsXG4gICAgYCRMT0NBVElPTjoke21lc3NhZ2UubG9jYXRpb24uZmlsZX0kJHttZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLnN0YXJ0LnJvd30kJHttZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLnN0YXJ0LmNvbHVtbn0kJHttZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLmVuZC5yb3d9JCR7bWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbi5lbmQuY29sdW1ufWAsXG4gICAgcmVmZXJlbmNlID8gYCRSRUZFUkVOQ0U6JHtyZWZlcmVuY2UuZmlsZX0kJHtyZWZlcmVuY2UucG9zaXRpb24gPyBgJHtyZWZlcmVuY2UucG9zaXRpb24ucm93fSQke3JlZmVyZW5jZS5wb3NpdGlvbi5jb2x1bW59YCA6ICcnfWAgOiAnJFJFRkVSRU5DRTpudWxsJyxcbiAgICBgJEVYQ0VSUFQ6JHttZXNzYWdlLmV4Y2VycHR9YCxcbiAgICBgJFNFVkVSSVRZOiR7bWVzc2FnZS5zZXZlcml0eX1gLFxuICAgIG1lc3NhZ2UuaWNvbiA/IGAkSUNPTjoke21lc3NhZ2UuaWNvbn1gIDogJyRJQ09OOm51bGwnLFxuICAgIG1lc3NhZ2UudXJsID8gYCRVUkw6JHttZXNzYWdlLnVybH1gIDogJyRVUkw6bnVsbCcsXG4gIF0uam9pbignJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZU1lc3NhZ2VzKGxpbnRlck5hbWU6IHN0cmluZywgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2U+KSB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBtZXNzYWdlc1tpXVxuICAgIGNvbnN0IHJlZmVyZW5jZSA9IG1lc3NhZ2UucmVmZXJlbmNlXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbikpIHtcbiAgICAgIG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24gPSBSYW5nZS5mcm9tT2JqZWN0KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pXG4gICAgfVxuICAgIGlmIChyZWZlcmVuY2UgJiYgQXJyYXkuaXNBcnJheShyZWZlcmVuY2UucG9zaXRpb24pKSB7XG4gICAgICByZWZlcmVuY2UucG9zaXRpb24gPSBQb2ludC5mcm9tT2JqZWN0KHJlZmVyZW5jZS5wb3NpdGlvbilcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uuc29sdXRpb25zICYmIG1lc3NhZ2Uuc29sdXRpb25zLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgaiA9IDAsIF9sZW5ndGggPSBtZXNzYWdlLnNvbHV0aW9ucy5sZW5ndGgsIHNvbHV0aW9uOyBqIDwgX2xlbmd0aDsgaisrKSB7XG4gICAgICAgIHNvbHV0aW9uID0gbWVzc2FnZS5zb2x1dGlvbnNbal1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc29sdXRpb24ucG9zaXRpb24pKSB7XG4gICAgICAgICAgc29sdXRpb24ucG9zaXRpb24gPSBSYW5nZS5mcm9tT2JqZWN0KHNvbHV0aW9uLnBvc2l0aW9uKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIG1lc3NhZ2UudmVyc2lvbiA9IDJcbiAgICBpZiAoIW1lc3NhZ2UubGludGVyTmFtZSkge1xuICAgICAgbWVzc2FnZS5saW50ZXJOYW1lID0gbGludGVyTmFtZVxuICAgIH1cbiAgICBtZXNzYWdlLmtleSA9IG1lc3NhZ2VLZXkobWVzc2FnZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVzc2FnZUtleUxlZ2FjeShtZXNzYWdlOiBNZXNzYWdlTGVnYWN5KTogc3RyaW5nIHtcbiAgcmV0dXJuIFtcbiAgICBgJExJTlRFUjoke21lc3NhZ2UubGludGVyTmFtZX1gLFxuICAgIGAkTE9DQVRJT046JHttZXNzYWdlLmZpbGVQYXRoIHx8ICcnfSQke21lc3NhZ2UucmFuZ2UgPyBgJHttZXNzYWdlLnJhbmdlLnN0YXJ0LnJvd30kJHttZXNzYWdlLnJhbmdlLnN0YXJ0LmNvbHVtbn0kJHttZXNzYWdlLnJhbmdlLmVuZC5yb3d9JCR7bWVzc2FnZS5yYW5nZS5lbmQuY29sdW1ufWAgOiAnJ31gLFxuICAgIGAkVEVYVDoke21lc3NhZ2UudGV4dCB8fCAnJ31gLFxuICAgIGAkSFRNTDoke21lc3NhZ2UuaHRtbCB8fCAnJ31gLFxuICAgIGAkU0VWRVJJVFk6JHttZXNzYWdlLnNldmVyaXR5fWAsXG4gICAgYCRUWVBFOiR7bWVzc2FnZS50eXBlfWAsXG4gICAgYCRDTEFTUzoke21lc3NhZ2UuY2xhc3MgfHwgJyd9YCxcbiAgXS5qb2luKCcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTWVzc2FnZXNMZWdhY3kobGludGVyTmFtZTogc3RyaW5nLCBtZXNzYWdlczogQXJyYXk8TWVzc2FnZUxlZ2FjeT4pIHtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IG1lc3NhZ2VzLmxlbmd0aDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXG4gICAgY29uc3QgZml4ID0gbWVzc2FnZS5maXhcbiAgICBpZiAobWVzc2FnZS5yYW5nZSAmJiBtZXNzYWdlLnJhbmdlLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdBcnJheScpIHtcbiAgICAgIG1lc3NhZ2UucmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KG1lc3NhZ2UucmFuZ2UpXG4gICAgfVxuICAgIGlmIChmaXggJiYgZml4LnJhbmdlLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdBcnJheScpIHtcbiAgICAgIGZpeC5yYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoZml4LnJhbmdlKVxuICAgIH1cbiAgICBpZiAoIW1lc3NhZ2Uuc2V2ZXJpdHkpIHtcbiAgICAgIGNvbnN0IHR5cGUgPSBtZXNzYWdlLnR5cGUudG9Mb3dlckNhc2UoKVxuICAgICAgaWYgKHR5cGUgPT09ICd3YXJuaW5nJykge1xuICAgICAgICBtZXNzYWdlLnNldmVyaXR5ID0gdHlwZVxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnaW5mbycgfHwgdHlwZSA9PT0gJ3RyYWNlJykge1xuICAgICAgICBtZXNzYWdlLnNldmVyaXR5ID0gJ2luZm8nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXNzYWdlLnNldmVyaXR5ID0gJ2Vycm9yJ1xuICAgICAgfVxuICAgIH1cbiAgICBtZXNzYWdlLnZlcnNpb24gPSAxXG4gICAgbWVzc2FnZS5saW50ZXJOYW1lID0gbGludGVyTmFtZVxuICAgIG1lc3NhZ2Uua2V5ID0gbWVzc2FnZUtleUxlZ2FjeShtZXNzYWdlKVxuXG4gICAgaWYgKG1lc3NhZ2UudHJhY2UpIHtcbiAgICAgIG5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KGxpbnRlck5hbWUsIG1lc3NhZ2UudHJhY2UpXG4gICAgfVxuICB9XG59XG4iXX0=