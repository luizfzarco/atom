(function() {
  var $, FOOTNOTE_REGEX, FOOTNOTE_TEST_REGEX, IMG_EXTENSIONS, IMG_OR_TEXT, IMG_REGEX, IMG_TAG_ATTRIBUTE, IMG_TAG_REGEX, INLINE_LINK_REGEX, INLINE_LINK_TEST_REGEX, LINK_ID, OPEN_TAG, REFERENCE_DEF_REGEX, REFERENCE_DEF_REGEX_OF, REFERENCE_LINK_REGEX, REFERENCE_LINK_REGEX_OF, REFERENCE_LINK_TEST_REGEX, SLUGIZE_CONTROL_REGEX, SLUGIZE_SPECIAL_REGEX, TABLE_ONE_COLUMN_ROW_REGEX, TABLE_ONE_COLUMN_SEPARATOR_REGEX, TABLE_ROW_REGEX, TABLE_SEPARATOR_REGEX, TEMPLATE_REGEX, UNTEMPLATE_REGEX, URL_AND_TITLE, URL_REGEX, capitalize, cleanDiacritics, createTableRow, createTableSeparator, createUntemplateMatcher, escapeRegExp, findLinkInRange, getAbsolutePath, getBufferRangeForScope, getDate, getHomedir, getJSON, getPackagePath, getProjectPath, getScopeDescriptor, getSitePath, getTextBufferRange, incrementChars, isFootnote, isImage, isImageFile, isImageTag, isInlineLink, isReferenceDefinition, isReferenceLink, isTableRow, isTableSeparator, isUpperCase, isUrl, normalizeFilePath, os, parseDate, parseFootnote, parseImage, parseImageTag, parseInlineLink, parseReferenceDefinition, parseReferenceLink, parseTableRow, parseTableSeparator, path, scanLinks, setTabIndex, slugize, template, untemplate, wcswidth,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = require("atom-space-pen-views").$;

  os = require("os");

  path = require("path");

  wcswidth = require("wcwidth");

  getJSON = function(uri, succeed, error) {
    if (uri.length === 0) {
      return error();
    }
    return $.getJSON(uri).done(succeed).fail(error);
  };

  escapeRegExp = function(str) {
    if (!str) {
      return "";
    }
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  capitalize = function(str) {
    if (!str) {
      return "";
    }
    return str.replace(/^[a-z]/, function(c) {
      return c.toUpperCase();
    });
  };

  isUpperCase = function(str) {
    if (str.length > 0) {
      return str[0] >= 'A' && str[0] <= 'Z';
    } else {
      return false;
    }
  };

  incrementChars = function(str) {
    var carry, chars, index, lowerCase, nextCharCode, upperCase;
    if (str.length < 1) {
      return "a";
    }
    upperCase = isUpperCase(str);
    if (upperCase) {
      str = str.toLowerCase();
    }
    chars = str.split("");
    carry = 1;
    index = chars.length - 1;
    while (carry !== 0 && index >= 0) {
      nextCharCode = chars[index].charCodeAt() + carry;
      if (nextCharCode > "z".charCodeAt()) {
        chars[index] = "a";
        index -= 1;
        carry = 1;
        lowerCase = 1;
      } else {
        chars[index] = String.fromCharCode(nextCharCode);
        carry = 0;
      }
    }
    if (carry === 1) {
      chars.unshift("a");
    }
    str = chars.join("");
    if (upperCase) {
      return str.toUpperCase();
    } else {
      return str;
    }
  };

  cleanDiacritics = function(str) {
    var from, to;
    if (!str) {
      return "";
    }
    from = "ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșšŝťțŭùúüűûñÿýçżźž";
    to = "aaaaaaaaaccceeeeeghiiiijllnnoooooooossssttuuuuuunyyczzz";
    from += from.toUpperCase();
    to += to.toUpperCase();
    to = to.split("");
    from += "ß";
    to.push('ss');
    return str.replace(/.{1}/g, function(c) {
      var index;
      index = from.indexOf(c);
      if (index === -1) {
        return c;
      } else {
        return to[index];
      }
    });
  };

  SLUGIZE_CONTROL_REGEX = /[\u0000-\u001f]/g;

  SLUGIZE_SPECIAL_REGEX = /[\s~`!@#\$%\^&\*\(\)\-_\+=\[\]\{\}\|\\;:"'<>,\.\?\/]+/g;

  slugize = function(str, separator) {
    var escapedSep;
    if (separator == null) {
      separator = '-';
    }
    if (!str) {
      return "";
    }
    escapedSep = escapeRegExp(separator);
    return cleanDiacritics(str).trim().toLowerCase().replace(SLUGIZE_CONTROL_REGEX, '').replace(SLUGIZE_SPECIAL_REGEX, separator).replace(new RegExp(escapedSep + '{2,}', 'g'), separator).replace(new RegExp('^' + escapedSep + '+|' + escapedSep + '+$', 'g'), '');
  };

  getPackagePath = function() {
    var segments;
    segments = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    segments.unshift(atom.packages.resolvePackagePath("markdown-writer"));
    return path.join.apply(null, segments);
  };

  getProjectPath = function() {
    var paths;
    paths = atom.project.getPaths();
    if (paths && paths.length > 0) {
      return paths[0];
    } else {
      return atom.config.get("core.projectHome");
    }
  };

  getSitePath = function(configPath) {
    return getAbsolutePath(configPath || getProjectPath());
  };

  getHomedir = function() {
    var env, home, user;
    if (typeof os.homedir === "function") {
      return os.homedir();
    }
    env = process.env;
    home = env.HOME;
    user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
    if (process.platform === "win32") {
      return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home;
    } else if (process.platform === "darwin") {
      return home || (user ? "/Users/" + user : void 0);
    } else if (process.platform === "linux") {
      return home || (process.getuid() === 0 ? "/root" : void 0) || (user ? "/home/" + user : void 0);
    } else {
      return home;
    }
  };

  getAbsolutePath = function(path) {
    var home;
    home = getHomedir();
    if (home) {
      return path.replace(/^~($|\/|\\)/, home + '$1');
    } else {
      return path;
    }
  };

  setTabIndex = function(elems) {
    var elem, i, j, len1, results1;
    results1 = [];
    for (i = j = 0, len1 = elems.length; j < len1; i = ++j) {
      elem = elems[i];
      results1.push(elem[0].tabIndex = i + 1);
    }
    return results1;
  };

  TEMPLATE_REGEX = /[\<\{]([\w\.\-]+?)[\>\}]/g;

  UNTEMPLATE_REGEX = /(?:\<|\\\{)([\w\.\-]+?)(?:\>|\\\})/g;

  template = function(text, data, matcher) {
    if (matcher == null) {
      matcher = TEMPLATE_REGEX;
    }
    return text.replace(matcher, function(match, attr) {
      if (data[attr] != null) {
        return data[attr];
      } else {
        return match;
      }
    });
  };

  untemplate = function(text, matcher) {
    var keys;
    if (matcher == null) {
      matcher = UNTEMPLATE_REGEX;
    }
    keys = [];
    text = escapeRegExp(text).replace(matcher, function(match, attr) {
      keys.push(attr);
      if (["year"].indexOf(attr) !== -1) {
        return "(\\d{4})";
      } else if (["month", "day", "hour", "minute", "second"].indexOf(attr) !== -1) {
        return "(\\d{2})";
      } else if (["i_month", "i_day", "i_hour", "i_minute", "i_second"].indexOf(attr) !== -1) {
        return "(\\d{1,2})";
      } else if (["extension"].indexOf(attr) !== -1) {
        return "(\\.\\w+)";
      } else {
        return "([\\s\\S]+)";
      }
    });
    return createUntemplateMatcher(keys, RegExp("^" + text + "$"));
  };

  createUntemplateMatcher = function(keys, regex) {
    return function(str) {
      var matches, results;
      if (!str) {
        return;
      }
      matches = regex.exec(str);
      if (!matches) {
        return;
      }
      results = {
        "_": matches[0]
      };
      keys.forEach(function(key, idx) {
        return results[key] = matches[idx + 1];
      });
      return results;
    };
  };

  parseDate = function(hash) {
    var date, key, map, value, values;
    date = new Date();
    map = {
      setYear: ["year"],
      setMonth: ["month", "i_month"],
      setDate: ["day", "i_day"],
      setHours: ["hour", "i_hour"],
      setMinutes: ["minute", "i_minute"],
      setSeconds: ["second", "i_second"]
    };
    for (key in map) {
      values = map[key];
      value = values.find(function(val) {
        return !!hash[val];
      });
      if (value) {
        value = parseInt(hash[value], 10);
        if (key === 'setMonth') {
          value = value - 1;
        }
        date[key](value);
      }
    }
    return getDate(date);
  };

  getDate = function(date) {
    if (date == null) {
      date = new Date();
    }
    return {
      year: "" + date.getFullYear(),
      month: ("0" + (date.getMonth() + 1)).slice(-2),
      day: ("0" + date.getDate()).slice(-2),
      hour: ("0" + date.getHours()).slice(-2),
      minute: ("0" + date.getMinutes()).slice(-2),
      second: ("0" + date.getSeconds()).slice(-2),
      i_month: "" + (date.getMonth() + 1),
      i_day: "" + date.getDate(),
      i_hour: "" + date.getHours(),
      i_minute: "" + date.getMinutes(),
      i_second: "" + date.getSeconds()
    };
  };

  IMG_TAG_REGEX = /<img(.*?)\/?>/i;

  IMG_TAG_ATTRIBUTE = /([a-z]+?)=('|")(.*?)\2/ig;

  isImageTag = function(input) {
    return IMG_TAG_REGEX.test(input);
  };

  parseImageTag = function(input) {
    var attributes, img, pattern;
    img = {};
    attributes = IMG_TAG_REGEX.exec(input)[1].match(IMG_TAG_ATTRIBUTE);
    pattern = RegExp("" + IMG_TAG_ATTRIBUTE.source, "i");
    attributes.forEach(function(attr) {
      var elem;
      elem = pattern.exec(attr);
      if (elem) {
        return img[elem[1]] = elem[3];
      }
    });
    return img;
  };

  URL_AND_TITLE = /(\S*?)(?: +["'\\(]?(.*?)["'\\)]?)?/.source;

  IMG_OR_TEXT = /(!\[.*?\]\(.+?\)|[^\[]+?)/.source;

  OPEN_TAG = /(?:^|[^!])(?=\[)/.source;

  LINK_ID = /[^\[\]]+/.source;

  IMG_REGEX = RegExp("!\\[(.*?)\\]\\(" + URL_AND_TITLE + "\\)");

  isImage = function(input) {
    return IMG_REGEX.test(input);
  };

  parseImage = function(input) {
    var image;
    image = IMG_REGEX.exec(input);
    if (image && image.length >= 2) {
      return {
        alt: image[1],
        src: image[2],
        title: image[3] || ""
      };
    } else {
      return {
        alt: input,
        src: "",
        title: ""
      };
    }
  };

  IMG_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".ico"];

  isImageFile = function(file) {
    var ref;
    return file && (ref = path.extname(file).toLowerCase(), indexOf.call(IMG_EXTENSIONS, ref) >= 0);
  };

  INLINE_LINK_REGEX = RegExp("\\[" + IMG_OR_TEXT + "\\]\\(" + URL_AND_TITLE + "\\)");

  INLINE_LINK_TEST_REGEX = RegExp("" + OPEN_TAG + INLINE_LINK_REGEX.source);

  isInlineLink = function(input) {
    return INLINE_LINK_TEST_REGEX.test(input);
  };

  parseInlineLink = function(input) {
    var link;
    link = INLINE_LINK_REGEX.exec(input);
    if (link && link.length >= 2) {
      return {
        text: link[1],
        url: link[2],
        title: link[3] || ""
      };
    } else {
      return {
        text: input,
        url: "",
        title: ""
      };
    }
  };

  scanLinks = function(editor, cb) {
    return editor.buffer.scan(RegExp("" + INLINE_LINK_REGEX.source, "g"), function(match) {
      var rg;
      rg = match.range;
      rg.start.column += match.match[1].length + 3;
      rg.end.column -= 1;
      return cb(rg);
    });
  };

  REFERENCE_LINK_REGEX_OF = function(id, opts) {
    if (opts == null) {
      opts = {};
    }
    if (!opts.noEscape) {
      id = escapeRegExp(id);
    }
    return RegExp("\\[(" + id + ")\\] ?\\[\\]|\\[" + IMG_OR_TEXT + "\\] ?\\[(" + id + ")\\]");
  };

  REFERENCE_DEF_REGEX_OF = function(id, opts) {
    if (opts == null) {
      opts = {};
    }
    if (!opts.noEscape) {
      id = escapeRegExp(id);
    }
    return RegExp("^ *\\[(" + id + ")\\]: +" + URL_AND_TITLE + "$", "m");
  };

  REFERENCE_LINK_REGEX = REFERENCE_LINK_REGEX_OF(LINK_ID, {
    noEscape: true
  });

  REFERENCE_LINK_TEST_REGEX = RegExp("" + OPEN_TAG + REFERENCE_LINK_REGEX.source);

  REFERENCE_DEF_REGEX = REFERENCE_DEF_REGEX_OF(LINK_ID, {
    noEscape: true
  });

  isReferenceLink = function(input) {
    return REFERENCE_LINK_TEST_REGEX.test(input);
  };

  parseReferenceLink = function(input, editor) {
    var def, id, link, text;
    link = REFERENCE_LINK_REGEX.exec(input);
    text = link[2] || link[1];
    id = link[3] || link[1];
    def = void 0;
    editor && editor.buffer.scan(REFERENCE_DEF_REGEX_OF(id), function(match) {
      return def = match;
    });
    if (def) {
      return {
        id: id,
        text: text,
        url: def.match[2],
        title: def.match[3] || "",
        definitionRange: def.range
      };
    } else {
      return {
        id: id,
        text: text,
        url: "",
        title: "",
        definitionRange: null
      };
    }
  };

  isReferenceDefinition = function(input) {
    var def;
    def = REFERENCE_DEF_REGEX.exec(input);
    return !!def && def[1][0] !== "^";
  };

  parseReferenceDefinition = function(input, editor) {
    var def, id, link;
    def = REFERENCE_DEF_REGEX.exec(input);
    id = def[1];
    link = void 0;
    editor && editor.buffer.scan(REFERENCE_LINK_REGEX_OF(id), function(match) {
      return link = match;
    });
    if (link) {
      return {
        id: id,
        text: link.match[2] || link.match[1],
        url: def[2],
        title: def[3] || "",
        linkRange: link.range
      };
    } else {
      return {
        id: id,
        text: "",
        url: def[2],
        title: def[3] || "",
        linkRange: null
      };
    }
  };

  FOOTNOTE_REGEX = /\[\^(.+?)\](:)?/;

  FOOTNOTE_TEST_REGEX = RegExp("" + OPEN_TAG + FOOTNOTE_REGEX.source);

  isFootnote = function(input) {
    return FOOTNOTE_TEST_REGEX.test(input);
  };

  parseFootnote = function(input) {
    var footnote;
    footnote = FOOTNOTE_REGEX.exec(input);
    return {
      label: footnote[1],
      isDefinition: footnote[2] === ":",
      content: ""
    };
  };

  TABLE_SEPARATOR_REGEX = /^(\|)?((?:\s*(?:-+|:-*:|:-*|-*:)\s*\|)+(?:\s*(?:-+|:-*:|:-*|-*:)\s*|\s+))(\|)?$/;

  TABLE_ONE_COLUMN_SEPARATOR_REGEX = /^(\|)(\s*:?-+:?\s*)(\|)$/;

  isTableSeparator = function(line) {
    return TABLE_SEPARATOR_REGEX.test(line) || TABLE_ONE_COLUMN_SEPARATOR_REGEX.test(line);
  };

  parseTableSeparator = function(line) {
    var columns, extraPipes, matches;
    matches = TABLE_SEPARATOR_REGEX.exec(line) || TABLE_ONE_COLUMN_SEPARATOR_REGEX.exec(line);
    extraPipes = !!(matches[1] || matches[matches.length - 1]);
    columns = matches[2].split("|").map(function(col) {
      return col.trim();
    });
    return {
      separator: true,
      extraPipes: extraPipes,
      columns: columns,
      columnWidths: columns.map(function(col) {
        return col.length;
      }),
      alignments: columns.map(function(col) {
        var head, tail;
        head = col[0] === ":";
        tail = col[col.length - 1] === ":";
        if (head && tail) {
          return "center";
        } else if (head) {
          return "left";
        } else if (tail) {
          return "right";
        } else {
          return "empty";
        }
      })
    };
  };

  TABLE_ROW_REGEX = /^(\|)?(.+?\|.+?)(\|)?$/;

  TABLE_ONE_COLUMN_ROW_REGEX = /^(\|)(.+?)(\|)$/;

  isTableRow = function(line) {
    return TABLE_ROW_REGEX.test(line) || TABLE_ONE_COLUMN_ROW_REGEX.test(line);
  };

  parseTableRow = function(line) {
    var columns, extraPipes, matches;
    if (isTableSeparator(line)) {
      return parseTableSeparator(line);
    }
    matches = TABLE_ROW_REGEX.exec(line) || TABLE_ONE_COLUMN_ROW_REGEX.exec(line);
    extraPipes = !!(matches[1] || matches[matches.length - 1]);
    columns = matches[2].split("|").map(function(col) {
      return col.trim();
    });
    return {
      separator: false,
      extraPipes: extraPipes,
      columns: columns,
      columnWidths: columns.map(function(col) {
        return wcswidth(col);
      })
    };
  };

  createTableSeparator = function(options) {
    var columnWidth, i, j, ref, row;
    if (options.columnWidths == null) {
      options.columnWidths = [];
    }
    if (options.alignments == null) {
      options.alignments = [];
    }
    row = [];
    for (i = j = 0, ref = options.numOfColumns - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      columnWidth = options.columnWidths[i] || options.columnWidth;
      if (!options.extraPipes && (i === 0 || i === options.numOfColumns - 1)) {
        columnWidth += 1;
      } else {
        columnWidth += 2;
      }
      switch (options.alignments[i] || options.alignment) {
        case "center":
          row.push(":" + "-".repeat(columnWidth - 2) + ":");
          break;
        case "left":
          row.push(":" + "-".repeat(columnWidth - 1));
          break;
        case "right":
          row.push("-".repeat(columnWidth - 1) + ":");
          break;
        default:
          row.push("-".repeat(columnWidth));
      }
    }
    row = row.join("|");
    if (options.extraPipes) {
      return "|" + row + "|";
    } else {
      return row;
    }
  };

  createTableRow = function(columns, options) {
    var columnWidth, i, j, len, ref, row;
    if (options.columnWidths == null) {
      options.columnWidths = [];
    }
    if (options.alignments == null) {
      options.alignments = [];
    }
    row = [];
    for (i = j = 0, ref = options.numOfColumns - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      columnWidth = options.columnWidths[i] || options.columnWidth;
      if (!columns[i]) {
        row.push(" ".repeat(columnWidth));
        continue;
      }
      len = columnWidth - wcswidth(columns[i]);
      if (len < 0) {
        throw new Error("Column width " + columnWidth + " - wcswidth('" + columns[i] + "') cannot be " + len);
      }
      switch (options.alignments[i] || options.alignment) {
        case "center":
          row.push(" ".repeat(len / 2) + columns[i] + " ".repeat((len + 1) / 2));
          break;
        case "left":
          row.push(columns[i] + " ".repeat(len));
          break;
        case "right":
          row.push(" ".repeat(len) + columns[i]);
          break;
        default:
          row.push(columns[i] + " ".repeat(len));
      }
    }
    row = row.join(" | ");
    if (options.extraPipes) {
      return "| " + row + " |";
    } else {
      return row;
    }
  };

  URL_REGEX = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i;

  isUrl = function(url) {
    return URL_REGEX.test(url);
  };

  normalizeFilePath = function(path) {
    return path.split(/[\\\/]/).join('/');
  };

  getScopeDescriptor = function(cursor, scopeSelector) {
    var scopes;
    scopes = cursor.getScopeDescriptor().getScopesArray().filter(function(scope) {
      return scope.indexOf(scopeSelector) >= 0;
    });
    if (scopes.indexOf(scopeSelector) >= 0) {
      return scopeSelector;
    } else if (scopes.length > 0) {
      return scopes[0];
    }
  };

  getBufferRangeForScope = function(editor, cursor, scopeSelector) {
    var pos, range;
    pos = cursor.getBufferPosition();
    range = editor.bufferRangeForScopeAtPosition(scopeSelector, pos);
    if (range) {
      return range;
    }
    if (!cursor.isAtBeginningOfLine()) {
      range = editor.bufferRangeForScopeAtPosition(scopeSelector, [pos.row, pos.column - 1]);
      if (range) {
        return range;
      }
    }
    if (!cursor.isAtEndOfLine()) {
      range = editor.bufferRangeForScopeAtPosition(scopeSelector, [pos.row, pos.column + 1]);
      if (range) {
        return range;
      }
    }
  };

  getTextBufferRange = function(editor, scopeSelector, selection, opts) {
    var cursor, scope, selectBy, wordRegex;
    if (opts == null) {
      opts = {};
    }
    if (typeof selection === "object") {
      opts = selection;
      selection = void 0;
    }
    if (selection == null) {
      selection = editor.getLastSelection();
    }
    cursor = selection.cursor;
    selectBy = opts["selectBy"] || "nearestWord";
    if (selection.getText()) {
      return selection.getBufferRange();
    } else if (scope = getScopeDescriptor(cursor, scopeSelector)) {
      return getBufferRangeForScope(editor, cursor, scope);
    } else if (selectBy === "nearestWord") {
      wordRegex = cursor.wordRegExp({
        includeNonWordCharacters: false
      });
      return cursor.getCurrentWordBufferRange({
        wordRegex: wordRegex
      });
    } else if (selectBy === "currentLine") {
      return cursor.getCurrentLineBufferRange();
    } else {
      return selection.getBufferRange();
    }
  };

  findLinkInRange = function(editor, range) {
    var link, selection;
    selection = editor.getTextInRange(range);
    if (selection === "") {
      return;
    }
    if (isUrl(selection)) {
      return {
        text: "",
        url: selection,
        title: ""
      };
    }
    if (isInlineLink(selection)) {
      return parseInlineLink(selection);
    }
    if (isReferenceLink(selection)) {
      link = parseReferenceLink(selection, editor);
      link.linkRange = range;
      return link;
    } else if (isReferenceDefinition(selection)) {
      selection = editor.lineTextForBufferRow(range.start.row);
      range = editor.bufferRangeForBufferRow(range.start.row);
      link = parseReferenceDefinition(selection, editor);
      link.definitionRange = range;
      return link;
    }
  };

  module.exports = {
    getJSON: getJSON,
    escapeRegExp: escapeRegExp,
    capitalize: capitalize,
    isUpperCase: isUpperCase,
    incrementChars: incrementChars,
    slugize: slugize,
    normalizeFilePath: normalizeFilePath,
    getPackagePath: getPackagePath,
    getProjectPath: getProjectPath,
    getSitePath: getSitePath,
    getHomedir: getHomedir,
    getAbsolutePath: getAbsolutePath,
    setTabIndex: setTabIndex,
    template: template,
    untemplate: untemplate,
    getDate: getDate,
    parseDate: parseDate,
    isImageTag: isImageTag,
    parseImageTag: parseImageTag,
    isImage: isImage,
    parseImage: parseImage,
    scanLinks: scanLinks,
    isInlineLink: isInlineLink,
    parseInlineLink: parseInlineLink,
    isReferenceLink: isReferenceLink,
    parseReferenceLink: parseReferenceLink,
    isReferenceDefinition: isReferenceDefinition,
    parseReferenceDefinition: parseReferenceDefinition,
    isFootnote: isFootnote,
    parseFootnote: parseFootnote,
    isTableSeparator: isTableSeparator,
    parseTableSeparator: parseTableSeparator,
    createTableSeparator: createTableSeparator,
    isTableRow: isTableRow,
    parseTableRow: parseTableRow,
    createTableRow: createTableRow,
    isUrl: isUrl,
    isImageFile: isImageFile,
    getTextBufferRange: getTextBufferRange,
    findLinkInRange: findLinkInRange
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZmVsaXBlLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3cUNBQUE7SUFBQTs7O0VBQUMsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBQ04sRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0VBTVgsT0FBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLE9BQU4sRUFBZSxLQUFmO0lBQ1IsSUFBa0IsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFoQztBQUFBLGFBQU8sS0FBQSxDQUFBLEVBQVA7O1dBQ0EsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxHQUFWLENBQWMsQ0FBQyxJQUFmLENBQW9CLE9BQXBCLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsS0FBbEM7RUFGUTs7RUFJVixZQUFBLEdBQWUsU0FBQyxHQUFEO0lBQ2IsSUFBQSxDQUFpQixHQUFqQjtBQUFBLGFBQU8sR0FBUDs7V0FDQSxHQUFHLENBQUMsT0FBSixDQUFZLHdCQUFaLEVBQXNDLE1BQXRDO0VBRmE7O0VBSWYsVUFBQSxHQUFhLFNBQUMsR0FBRDtJQUNYLElBQUEsQ0FBaUIsR0FBakI7QUFBQSxhQUFPLEdBQVA7O1dBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEVBQXNCLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxXQUFGLENBQUE7SUFBUCxDQUF0QjtFQUZXOztFQUliLFdBQUEsR0FBYyxTQUFDLEdBQUQ7SUFDWixJQUFHLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBaEI7YUFBd0IsR0FBSSxDQUFBLENBQUEsQ0FBSixJQUFVLEdBQVYsSUFBaUIsR0FBSSxDQUFBLENBQUEsQ0FBSixJQUFVLElBQW5EO0tBQUEsTUFBQTthQUNLLE1B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LEVBQVksVUFYWjtJQVlBLGVBQUEsRUFBaUIsZUFaakI7SUFjQSxXQUFBLEVBQWEsV0FkYjtJQWdCQSxRQUFBLEVBQVUsUUFoQlY7SUFpQkEsVUFBQSxFQUFZLFVBakJaO0lBbUJBLE9BQUEsRUFBUyxPQW5CVDtJQW9CQSxTQUFBLEVBQVcsU0FwQlg7SUFzQkEsVUFBQSxFQUFZLFVBdEJaO0lBdUJBLGFBQUEsRUFBZSxhQXZCZjtJQXdCQSxPQUFBLEVBQVMsT0F4QlQ7SUF5QkEsVUFBQSxFQUFZLFVBekJaO0lBMkJBLFNBQUEsRUFBVyxTQTNCWDtJQTRCQSxZQUFBLEVBQWMsWUE1QmQ7SUE2QkEsZUFBQSxFQUFpQixlQTdCakI7SUE4QkEsZUFBQSxFQUFpQixlQTlCakI7SUErQkEsa0JBQUEsRUFBb0Isa0JBL0JwQjtJQWdDQSxxQkFBQSxFQUF1QixxQkFoQ3ZCO0lBaUNBLHdCQUFBLEVBQTBCLHdCQWpDMUI7SUFtQ0EsVUFBQSxFQUFZLFVBbkNaO0lBb0NBLGFBQUEsRUFBZSxhQXBDZjtJQXNDQSxnQkFBQSxFQUFrQixnQkF0Q2xCO0lBdUNBLG1CQUFBLEVBQXFCLG1CQXZDckI7SUF3Q0Esb0JBQUEsRUFBc0Isb0JBeEN0QjtJQXlDQSxVQUFBLEVBQVksVUF6Q1o7SUEwQ0EsYUFBQSxFQUFlLGFBMUNmO0lBMkNBLGNBQUEsRUFBZ0IsY0EzQ2hCO0lBNkNBLEtBQUEsRUFBTyxLQTdDUDtJQThDQSxXQUFBLEVBQWEsV0E5Q2I7SUFnREEsa0JBQUEsRUFBb0Isa0JBaERwQjtJQWlEQSxlQUFBLEVBQWlCLGVBakRqQjs7QUFucEJGIiwic291cmNlc0NvbnRlbnQiOlsieyR9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbm9zID0gcmVxdWlyZSBcIm9zXCJcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG53Y3N3aWR0aCA9IHJlcXVpcmUgXCJ3Y3dpZHRoXCJcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBHZW5lcmFsIFV0aWxzXG4jXG5cbmdldEpTT04gPSAodXJpLCBzdWNjZWVkLCBlcnJvcikgLT5cbiAgcmV0dXJuIGVycm9yKCkgaWYgdXJpLmxlbmd0aCA9PSAwXG4gICQuZ2V0SlNPTih1cmkpLmRvbmUoc3VjY2VlZCkuZmFpbChlcnJvcilcblxuZXNjYXBlUmVnRXhwID0gKHN0cikgLT5cbiAgcmV0dXJuIFwiXCIgdW5sZXNzIHN0clxuICBzdHIucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKVxuXG5jYXBpdGFsaXplID0gKHN0cikgLT5cbiAgcmV0dXJuIFwiXCIgdW5sZXNzIHN0clxuICBzdHIucmVwbGFjZSAvXlthLXpdLywgKGMpIC0+IGMudG9VcHBlckNhc2UoKVxuXG5pc1VwcGVyQ2FzZSA9IChzdHIpIC0+XG4gIGlmIHN0ci5sZW5ndGggPiAwIHRoZW4gKHN0clswXSA+PSAnQScgJiYgc3RyWzBdIDw9ICdaJylcbiAgZWxzZSBmYWxzZVxuXG4jIGluY3JlbWVudCB0aGUgY2hhcnM6IGEgLT4gYiwgeiAtPiBhYSwgYXogLT4gYmFcbmluY3JlbWVudENoYXJzID0gKHN0cikgLT5cbiAgcmV0dXJuIFwiYVwiIGlmIHN0ci5sZW5ndGggPCAxXG5cbiAgdXBwZXJDYXNlID0gaXNVcHBlckNhc2Uoc3RyKVxuICBzdHIgPSBzdHIudG9Mb3dlckNhc2UoKSBpZiB1cHBlckNhc2VcblxuICBjaGFycyA9IHN0ci5zcGxpdChcIlwiKVxuICBjYXJyeSA9IDFcbiAgaW5kZXggPSBjaGFycy5sZW5ndGggLSAxXG5cbiAgd2hpbGUgY2FycnkgIT0gMCAmJiBpbmRleCA+PSAwXG4gICAgbmV4dENoYXJDb2RlID0gY2hhcnNbaW5kZXhdLmNoYXJDb2RlQXQoKSArIGNhcnJ5XG5cbiAgICBpZiBuZXh0Q2hhckNvZGUgPiBcInpcIi5jaGFyQ29kZUF0KClcbiAgICAgIGNoYXJzW2luZGV4XSA9IFwiYVwiXG4gICAgICBpbmRleCAtPSAxXG4gICAgICBjYXJyeSA9IDFcbiAgICAgIGxvd2VyQ2FzZSA9IDFcbiAgICBlbHNlXG4gICAgICBjaGFyc1tpbmRleF0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHRDaGFyQ29kZSlcbiAgICAgIGNhcnJ5ID0gMFxuXG4gIGNoYXJzLnVuc2hpZnQoXCJhXCIpIGlmIGNhcnJ5ID09IDFcblxuICBzdHIgPSBjaGFycy5qb2luKFwiXCIpXG4gIGlmIHVwcGVyQ2FzZSB0aGVuIHN0ci50b1VwcGVyQ2FzZSgpIGVsc2Ugc3RyXG5cbiMgaHR0cHM6Ly9naXRodWIuY29tL2VwZWxpL3VuZGVyc2NvcmUuc3RyaW5nL2Jsb2IvbWFzdGVyL2NsZWFuRGlhY3JpdGljcy5qc1xuY2xlYW5EaWFjcml0aWNzID0gKHN0cikgLT5cbiAgcmV0dXJuIFwiXCIgdW5sZXNzIHN0clxuXG4gIGZyb20gPSBcIsSFw6DDocOkw6LDo8Olw6bEg8SHxI3EicSZw6jDqcOrw6rEncSlw6zDrcOvw67EtcWCxL7FhMWIw7LDs8O2xZHDtMO1w7DDuMWbyJnFocWdxaXIm8Wtw7nDusO8xbHDu8Oxw7/DvcOnxbzFusW+XCJcbiAgdG8gPSBcImFhYWFhYWFhYWNjY2VlZWVlZ2hpaWlpamxsbm5vb29vb29vb3Nzc3N0dHV1dXV1dW55eWN6enpcIlxuXG4gIGZyb20gKz0gZnJvbS50b1VwcGVyQ2FzZSgpXG4gIHRvICs9IHRvLnRvVXBwZXJDYXNlKClcblxuICB0byA9IHRvLnNwbGl0KFwiXCIpXG5cbiAgIyBmb3IgdG9rZW5zIHJlcXVpcmVpbmcgbXVsdGl0b2tlbiBvdXRwdXRcbiAgZnJvbSArPSBcIsOfXCJcbiAgdG8ucHVzaCgnc3MnKVxuXG4gIHN0ci5yZXBsYWNlIC8uezF9L2csIChjKSAtPlxuICAgIGluZGV4ID0gZnJvbS5pbmRleE9mKGMpXG4gICAgaWYgaW5kZXggPT0gLTEgdGhlbiBjIGVsc2UgdG9baW5kZXhdXG5cblNMVUdJWkVfQ09OVFJPTF9SRUdFWCA9IC9bXFx1MDAwMC1cXHUwMDFmXS9nXG5TTFVHSVpFX1NQRUNJQUxfUkVHRVggPSAvW1xcc35gIUAjXFwkJVxcXiZcXCpcXChcXClcXC1fXFwrPVxcW1xcXVxce1xcfVxcfFxcXFw7OlwiJzw+LFxcLlxcP1xcL10rL2dcblxuIyBodHRwczovL2dpdGh1Yi5jb20vaGV4b2pzL2hleG8tdXRpbC9ibG9iL21hc3Rlci9saWIvc2x1Z2l6ZS5qc1xuc2x1Z2l6ZSA9IChzdHIsIHNlcGFyYXRvciA9ICctJykgLT5cbiAgcmV0dXJuIFwiXCIgdW5sZXNzIHN0clxuXG4gIGVzY2FwZWRTZXAgPSBlc2NhcGVSZWdFeHAoc2VwYXJhdG9yKVxuXG4gIGNsZWFuRGlhY3JpdGljcyhzdHIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gICAgIyBSZW1vdmUgY29udHJvbCBjaGFyYWN0ZXJzXG4gICAgLnJlcGxhY2UoU0xVR0laRV9DT05UUk9MX1JFR0VYLCAnJylcbiAgICAjIFJlcGxhY2Ugc3BlY2lhbCBjaGFyYWN0ZXJzXG4gICAgLnJlcGxhY2UoU0xVR0laRV9TUEVDSUFMX1JFR0VYLCBzZXBhcmF0b3IpXG4gICAgIyBSZW1vdmUgY29udGlub3VzIHNlcGFyYXRvcnNcbiAgICAucmVwbGFjZShuZXcgUmVnRXhwKGVzY2FwZWRTZXAgKyAnezIsfScsICdnJyksIHNlcGFyYXRvcilcbiAgICAjIFJlbW92ZSBwcmVmaXhpbmcgYW5kIHRyYWlsaW5nIHNlcGFydG9yc1xuICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgZXNjYXBlZFNlcCArICcrfCcgKyBlc2NhcGVkU2VwICsgJyskJywgJ2cnKSwgJycpXG5cbmdldFBhY2thZ2VQYXRoID0gKHNlZ21lbnRzLi4uKSAtPlxuICBzZWdtZW50cy51bnNoaWZ0KGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKFwibWFya2Rvd24td3JpdGVyXCIpKVxuICBwYXRoLmpvaW4uYXBwbHkobnVsbCwgc2VnbWVudHMpXG5cbmdldFByb2plY3RQYXRoID0gLT5cbiAgcGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICBpZiBwYXRocyAmJiBwYXRocy5sZW5ndGggPiAwXG4gICAgcGF0aHNbMF1cbiAgZWxzZSAjIEdpdmUgdGhlIHVzZXIgYSBwYXRoIGlmIHRoZXJlJ3Mgbm8gcHJvamVjdCBwYXRocy5cbiAgICBhdG9tLmNvbmZpZy5nZXQoXCJjb3JlLnByb2plY3RIb21lXCIpXG5cbmdldFNpdGVQYXRoID0gKGNvbmZpZ1BhdGgpIC0+XG4gIGdldEFic29sdXRlUGF0aChjb25maWdQYXRoIHx8IGdldFByb2plY3RQYXRoKCkpXG5cbiMgaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9vcy1ob21lZGlyL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5nZXRIb21lZGlyID0gLT5cbiAgcmV0dXJuIG9zLmhvbWVkaXIoKSBpZiB0eXBlb2Yob3MuaG9tZWRpcikgPT0gXCJmdW5jdGlvblwiXG5cbiAgZW52ID0gcHJvY2Vzcy5lbnZcbiAgaG9tZSA9IGVudi5IT01FXG4gIHVzZXIgPSBlbnYuTE9HTkFNRSB8fCBlbnYuVVNFUiB8fCBlbnYuTE5BTUUgfHwgZW52LlVTRVJOQU1FXG5cbiAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSBcIndpbjMyXCJcbiAgICBlbnYuVVNFUlBST0ZJTEUgfHwgZW52LkhPTUVEUklWRSArIGVudi5IT01FUEFUSCB8fCBob21lXG4gIGVsc2UgaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSBcImRhcndpblwiXG4gICAgaG9tZSB8fCAoXCIvVXNlcnMvXCIgKyB1c2VyIGlmIHVzZXIpXG4gIGVsc2UgaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSBcImxpbnV4XCJcbiAgICBob21lIHx8IChcIi9yb290XCIgaWYgcHJvY2Vzcy5nZXR1aWQoKSA9PSAwKSB8fCAoXCIvaG9tZS9cIiArIHVzZXIgaWYgdXNlcilcbiAgZWxzZVxuICAgIGhvbWVcblxuIyBCYXNpY2FsbHkgZXhwYW5kIH4vIHRvIGhvbWUgZGlyZWN0b3J5XG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvdW50aWxkaWZ5L2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5nZXRBYnNvbHV0ZVBhdGggPSAocGF0aCkgLT5cbiAgaG9tZSA9IGdldEhvbWVkaXIoKVxuICBpZiBob21lIHRoZW4gcGF0aC5yZXBsYWNlKC9efigkfFxcL3xcXFxcKS8sIGhvbWUgKyAnJDEnKSBlbHNlIHBhdGhcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBHZW5lcmFsIFZpZXcgSGVscGVyc1xuI1xuXG5zZXRUYWJJbmRleCA9IChlbGVtcykgLT5cbiAgZWxlbVswXS50YWJJbmRleCA9IGkgKyAxIGZvciBlbGVtLCBpIGluIGVsZW1zXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgVGVtcGxhdGVcbiNcblxuVEVNUExBVEVfUkVHRVggPSAvLy9cbiAgW1xcPFxce10gICAgICAgICMgc3RhcnQgd2l0aCA8IG9yIHtcbiAgKFtcXHdcXC5cXC1dKz8pICAjIGFueSByZWFzb25hYmxlIHdvcmRzLCAtIG9yIC5cbiAgW1xcPlxcfV0gICAgICAgICMgZW5kIHdpdGggPiBvciB9XG4gIC8vL2dcblxuVU5URU1QTEFURV9SRUdFWCA9IC8vL1xuICAoPzpcXDx8XFxcXFxceykgICAjIHN0YXJ0IHdpdGggPCBvciBcXHtcbiAgKFtcXHdcXC5cXC1dKz8pICAjIGFueSByZWFzb25hYmxlIHdvcmRzLCAtIG9yIC5cbiAgKD86XFw+fFxcXFxcXH0pICAgIyBlbmQgd2l0aCA+IG9yIFxcfVxuICAvLy9nXG5cbnRlbXBsYXRlID0gKHRleHQsIGRhdGEsIG1hdGNoZXIgPSBURU1QTEFURV9SRUdFWCkgLT5cbiAgdGV4dC5yZXBsYWNlIG1hdGNoZXIsIChtYXRjaCwgYXR0cikgLT5cbiAgICBpZiBkYXRhW2F0dHJdPyB0aGVuIGRhdGFbYXR0cl0gZWxzZSBtYXRjaFxuXG4jIFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgcmV2ZXJzZSBwYXJzZSB0aGUgdGVtcGxhdGUsIGUuZy5cbiNcbiMgUGFzcyBgdW50ZW1wbGF0ZShcInt5ZWFyfS17bW9udGh9XCIpYCByZXR1cm5zIGEgZnVuY3Rpb24gYGZuYCwgdGhhdCBgZm4oXCIyMDE1LTExXCIpICMgPT4geyBfOiBcIjIwMTUtMTFcIiwgeWVhcjogMjAxNSwgbW9udGg6IDExIH1gXG4jXG51bnRlbXBsYXRlID0gKHRleHQsIG1hdGNoZXIgPSBVTlRFTVBMQVRFX1JFR0VYKSAtPlxuICBrZXlzID0gW11cblxuICB0ZXh0ID0gZXNjYXBlUmVnRXhwKHRleHQpLnJlcGxhY2UgbWF0Y2hlciwgKG1hdGNoLCBhdHRyKSAtPlxuICAgIGtleXMucHVzaChhdHRyKVxuICAgIGlmIFtcInllYXJcIl0uaW5kZXhPZihhdHRyKSAhPSAtMSB0aGVuIFwiKFxcXFxkezR9KVwiXG4gICAgZWxzZSBpZiBbXCJtb250aFwiLCBcImRheVwiLCBcImhvdXJcIiwgXCJtaW51dGVcIiwgXCJzZWNvbmRcIl0uaW5kZXhPZihhdHRyKSAhPSAtMSB0aGVuIFwiKFxcXFxkezJ9KVwiXG4gICAgZWxzZSBpZiBbXCJpX21vbnRoXCIsIFwiaV9kYXlcIiwgXCJpX2hvdXJcIiwgXCJpX21pbnV0ZVwiLCBcImlfc2Vjb25kXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcZHsxLDJ9KVwiXG4gICAgZWxzZSBpZiBbXCJleHRlbnNpb25cIl0uaW5kZXhPZihhdHRyKSAhPSAtMSB0aGVuIFwiKFxcXFwuXFxcXHcrKVwiXG4gICAgZWxzZSBcIihbXFxcXHNcXFxcU10rKVwiXG5cbiAgY3JlYXRlVW50ZW1wbGF0ZU1hdGNoZXIoa2V5cywgLy8vIF4gI3t0ZXh0fSAkIC8vLylcblxuY3JlYXRlVW50ZW1wbGF0ZU1hdGNoZXIgPSAoa2V5cywgcmVnZXgpIC0+XG4gIChzdHIpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBzdHJcblxuICAgIG1hdGNoZXMgPSByZWdleC5leGVjKHN0cilcbiAgICByZXR1cm4gdW5sZXNzIG1hdGNoZXNcblxuICAgIHJlc3VsdHMgPSB7IFwiX1wiIDogbWF0Y2hlc1swXSB9XG4gICAga2V5cy5mb3JFYWNoIChrZXksIGlkeCkgLT4gcmVzdWx0c1trZXldID0gbWF0Y2hlc1tpZHggKyAxXVxuICAgIHJlc3VsdHNcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBEYXRlIGFuZCBUaW1lXG4jXG5cbnBhcnNlRGF0ZSA9IChoYXNoKSAtPlxuICBkYXRlID0gbmV3IERhdGUoKVxuXG4gIG1hcCA9XG4gICAgc2V0WWVhcjogW1wieWVhclwiXVxuICAgIHNldE1vbnRoOiBbXCJtb250aFwiLCBcImlfbW9udGhcIl1cbiAgICBzZXREYXRlOiBbXCJkYXlcIiwgXCJpX2RheVwiXVxuICAgIHNldEhvdXJzOiBbXCJob3VyXCIsIFwiaV9ob3VyXCJdXG4gICAgc2V0TWludXRlczogW1wibWludXRlXCIsIFwiaV9taW51dGVcIl1cbiAgICBzZXRTZWNvbmRzOiBbXCJzZWNvbmRcIiwgXCJpX3NlY29uZFwiXVxuXG4gIGZvciBrZXksIHZhbHVlcyBvZiBtYXBcbiAgICB2YWx1ZSA9IHZhbHVlcy5maW5kICh2YWwpIC0+ICEhaGFzaFt2YWxdXG4gICAgaWYgdmFsdWVcbiAgICAgIHZhbHVlID0gcGFyc2VJbnQoaGFzaFt2YWx1ZV0sIDEwKVxuICAgICAgdmFsdWUgPSB2YWx1ZSAtIDEgaWYga2V5ID09ICdzZXRNb250aCdcbiAgICAgIGRhdGVba2V5XSh2YWx1ZSlcblxuICBnZXREYXRlKGRhdGUpXG5cbmdldERhdGUgPSAoZGF0ZSA9IG5ldyBEYXRlKCkpIC0+XG4gIHllYXI6IFwiXCIgKyBkYXRlLmdldEZ1bGxZZWFyKClcbiAgIyB3aXRoIHByZXBlbmRlZCAwXG4gIG1vbnRoOiAoXCIwXCIgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkpLnNsaWNlKC0yKVxuICBkYXk6IChcIjBcIiArIGRhdGUuZ2V0RGF0ZSgpKS5zbGljZSgtMilcbiAgaG91cjogKFwiMFwiICsgZGF0ZS5nZXRIb3VycygpKS5zbGljZSgtMilcbiAgbWludXRlOiAoXCIwXCIgKyBkYXRlLmdldE1pbnV0ZXMoKSkuc2xpY2UoLTIpXG4gIHNlY29uZDogKFwiMFwiICsgZGF0ZS5nZXRTZWNvbmRzKCkpLnNsaWNlKC0yKVxuICAjIHdpdGhvdXQgcHJlcGVuZCAwXG4gIGlfbW9udGg6IFwiXCIgKyAoZGF0ZS5nZXRNb250aCgpICsgMSlcbiAgaV9kYXk6IFwiXCIgKyBkYXRlLmdldERhdGUoKVxuICBpX2hvdXI6IFwiXCIgKyBkYXRlLmdldEhvdXJzKClcbiAgaV9taW51dGU6IFwiXCIgKyBkYXRlLmdldE1pbnV0ZXMoKVxuICBpX3NlY29uZDogXCJcIiArIGRhdGUuZ2V0U2Vjb25kcygpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgSW1hZ2UgSFRNTCBUYWdcbiNcblxuSU1HX1RBR19SRUdFWCA9IC8vLyA8aW1nICguKj8pXFwvPz4gLy8vaVxuSU1HX1RBR19BVFRSSUJVVEUgPSAvLy8gKFthLXpdKz8pPSgnfFwiKSguKj8pXFwyIC8vL2lnXG5cbiMgRGV0ZWN0IGl0IGlzIGEgSFRNTCBpbWFnZSB0YWdcbmlzSW1hZ2VUYWcgPSAoaW5wdXQpIC0+IElNR19UQUdfUkVHRVgudGVzdChpbnB1dClcbnBhcnNlSW1hZ2VUYWcgPSAoaW5wdXQpIC0+XG4gIGltZyA9IHt9XG4gIGF0dHJpYnV0ZXMgPSBJTUdfVEFHX1JFR0VYLmV4ZWMoaW5wdXQpWzFdLm1hdGNoKElNR19UQUdfQVRUUklCVVRFKVxuICBwYXR0ZXJuID0gLy8vICN7SU1HX1RBR19BVFRSSUJVVEUuc291cmNlfSAvLy9pXG4gIGF0dHJpYnV0ZXMuZm9yRWFjaCAoYXR0cikgLT5cbiAgICBlbGVtID0gcGF0dGVybi5leGVjKGF0dHIpXG4gICAgaW1nW2VsZW1bMV1dID0gZWxlbVszXSBpZiBlbGVtXG4gIHJldHVybiBpbWdcblxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFNvbWUgc2hhcmVkIHJlZ2V4IGJhc2ljc1xuI1xuXG4jIFt1cmx8dXJsIFwidGl0bGVcIl1cblVSTF9BTkRfVElUTEUgPSAvLy9cbiAgKFxcUyo/KSAgICAgICAgICAgICAgICAgICMgYSB1cmxcbiAgKD86XG4gICAgXFwgKyAgICAgICAgICAgICAgICAgICAjIHNwYWNlc1xuICAgIFtcIidcXFxcKF0/KC4qPylbXCInXFxcXCldPyAjIHF1b3RlZCB0aXRsZVxuICApPyAgICAgICAgICAgICAgICAgICAgICAjIG1pZ2h0IG5vdCBwcmVzZW50XG4gIC8vLy5zb3VyY2VcblxuIyBbaW1hZ2V8dGV4dF1cbklNR19PUl9URVhUID0gLy8vICghXFxbLio/XFxdXFwoLis/XFwpIHwgW15cXFtdKz8pIC8vLy5zb3VyY2VcbiMgYXQgaGVhZCBvciBub3QgIVssIHdvcmthcm91bmQgb2Ygbm8gbmVnLWxvb2tiZWhpbmQgaW4gSlNcbk9QRU5fVEFHID0gLy8vICg/Ol58W14hXSkoPz1cXFspIC8vLy5zb3VyY2VcbiMgbGluayBpZCBkb24ndCBjb250YWlucyBbIG9yIF1cbkxJTktfSUQgPSAvLy8gW15cXFtcXF1dKyAvLy8uc291cmNlXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgSW1hZ2VcbiNcblxuSU1HX1JFR0VYICA9IC8vL1xuICAhIFxcWyAoLio/KSBcXF0gICAgICAgICAgICAjICFbZW1wdHl8dGV4dF1cbiAgICBcXCggI3tVUkxfQU5EX1RJVExFfSBcXCkgIyAoaW1hZ2UgcGF0aCwgYW55IGRlc2NyaXB0aW9uKVxuICAvLy9cblxuaXNJbWFnZSA9IChpbnB1dCkgLT4gSU1HX1JFR0VYLnRlc3QoaW5wdXQpXG5wYXJzZUltYWdlID0gKGlucHV0KSAtPlxuICBpbWFnZSA9IElNR19SRUdFWC5leGVjKGlucHV0KVxuXG4gIGlmIGltYWdlICYmIGltYWdlLmxlbmd0aCA+PSAyXG4gICAgcmV0dXJuIGFsdDogaW1hZ2VbMV0sIHNyYzogaW1hZ2VbMl0sIHRpdGxlOiBpbWFnZVszXSB8fCBcIlwiXG4gIGVsc2VcbiAgICByZXR1cm4gYWx0OiBpbnB1dCwgc3JjOiBcIlwiLCB0aXRsZTogXCJcIlxuXG5JTUdfRVhURU5TSU9OUyA9IFtcIi5qcGdcIiwgXCIuanBlZ1wiLCBcIi5wbmdcIiwgXCIuZ2lmXCIsIFwiLmljb1wiXVxuXG5pc0ltYWdlRmlsZSA9IChmaWxlKSAtPlxuICBmaWxlICYmIChwYXRoLmV4dG5hbWUoZmlsZSkudG9Mb3dlckNhc2UoKSBpbiBJTUdfRVhURU5TSU9OUylcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBJbmxpbmUgbGlua1xuI1xuXG5JTkxJTkVfTElOS19SRUdFWCA9IC8vL1xuICBcXFsgI3tJTUdfT1JfVEVYVH0gXFxdICAgIyBbaW1hZ2V8dGV4dF1cbiAgXFwoICN7VVJMX0FORF9USVRMRX0gXFwpICMgKHVybCBcImFueSB0aXRsZVwiKVxuICAvLy9cblxuSU5MSU5FX0xJTktfVEVTVF9SRUdFWCA9IC8vL1xuICAje09QRU5fVEFHfVxuICAje0lOTElORV9MSU5LX1JFR0VYLnNvdXJjZX1cbiAgLy8vXG5cbmlzSW5saW5lTGluayA9IChpbnB1dCkgLT4gSU5MSU5FX0xJTktfVEVTVF9SRUdFWC50ZXN0KGlucHV0KVxucGFyc2VJbmxpbmVMaW5rID0gKGlucHV0KSAtPlxuICBsaW5rID0gSU5MSU5FX0xJTktfUkVHRVguZXhlYyhpbnB1dClcblxuICBpZiBsaW5rICYmIGxpbmsubGVuZ3RoID49IDJcbiAgICB0ZXh0OiBsaW5rWzFdLCB1cmw6IGxpbmtbMl0sIHRpdGxlOiBsaW5rWzNdIHx8IFwiXCJcbiAgZWxzZVxuICAgIHRleHQ6IGlucHV0LCB1cmw6IFwiXCIsIHRpdGxlOiBcIlwiXG5cbnNjYW5MaW5rcyA9IChlZGl0b3IsIGNiKSAtPlxuICBlZGl0b3IuYnVmZmVyLnNjYW4gLy8vICN7SU5MSU5FX0xJTktfUkVHRVguc291cmNlfSAvLy9nLCAobWF0Y2gpIC0+XG4gICAgcmcgPSBtYXRjaC5yYW5nZVxuICAgIHJnLnN0YXJ0LmNvbHVtbiArPSBtYXRjaC5tYXRjaFsxXS5sZW5ndGggKyAzICMgW10oXG4gICAgcmcuZW5kLmNvbHVtbiAtPSAxXG4gICAgY2IocmcpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUmVmZXJlbmNlIGxpbmtcbiNcblxuIyBNYXRjaCByZWZlcmVuY2UgbGluayBbdGV4dF1baWRdXG5SRUZFUkVOQ0VfTElOS19SRUdFWF9PRiA9IChpZCwgb3B0cyA9IHt9KSAtPlxuICBpZCA9IGVzY2FwZVJlZ0V4cChpZCkgdW5sZXNzIG9wdHMubm9Fc2NhcGVcbiAgLy8vXG4gIFxcWygje2lkfSlcXF1cXCA/XFxbXFxdICAgICAgICAgICAgICAgIyBbdGV4dF1bXVxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIG9yXG4gIFxcWyN7SU1HX09SX1RFWFR9XFxdXFwgP1xcWygje2lkfSlcXF0gIyBbaW1hZ2V8dGV4dF1baWRdXG4gIC8vL1xuXG4jIE1hdGNoIHJlZmVyZW5jZSBsaW5rIGRlZmluaXRpb25zIFtpZF06IHVybFxuUkVGRVJFTkNFX0RFRl9SRUdFWF9PRiA9IChpZCwgb3B0cyA9IHt9KSAtPlxuICBpZCA9IGVzY2FwZVJlZ0V4cChpZCkgdW5sZXNzIG9wdHMubm9Fc2NhcGVcbiAgLy8vXG4gIF4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgc3RhcnQgb2YgbGluZVxuICBcXCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBhbnkgbGVhZGluZyBzcGFjZXNcbiAgXFxbKCN7aWR9KVxcXTpcXCArICAgICAgICAgICAgICAgIyBbaWRdOiBmb2xsb3dlZCBieSBzcGFjZXNcbiAgI3tVUkxfQU5EX1RJVExFfSAgICAgICAgICAgICAgIyBsaW5rIFwidGl0bGVcIlxuICAkXG4gIC8vL21cblxuIyBSRUZFUkVOQ0VfTElOS19SRUdFWC5leGVjKFwiW3RleHRdW2lkXVwiKVxuIyA9PiBbXCJbdGV4dF1baWRdXCIsIHVuZGVmaW5lZCwgXCJ0ZXh0XCIsIFwiaWRcIl1cbiNcbiMgUkVGRVJFTkNFX0xJTktfUkVHRVguZXhlYyhcIlt0ZXh0XVtdXCIpXG4jID0+IFtcIlt0ZXh0XVtdXCIsIFwidGV4dFwiLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1cblJFRkVSRU5DRV9MSU5LX1JFR0VYID0gUkVGRVJFTkNFX0xJTktfUkVHRVhfT0YoTElOS19JRCwgbm9Fc2NhcGU6IHRydWUpXG5SRUZFUkVOQ0VfTElOS19URVNUX1JFR0VYID0gLy8vXG4gICN7T1BFTl9UQUd9XG4gICN7UkVGRVJFTkNFX0xJTktfUkVHRVguc291cmNlfVxuICAvLy9cblxuUkVGRVJFTkNFX0RFRl9SRUdFWCA9IFJFRkVSRU5DRV9ERUZfUkVHRVhfT0YoTElOS19JRCwgbm9Fc2NhcGU6IHRydWUpXG5cbmlzUmVmZXJlbmNlTGluayA9IChpbnB1dCkgLT4gUkVGRVJFTkNFX0xJTktfVEVTVF9SRUdFWC50ZXN0KGlucHV0KVxucGFyc2VSZWZlcmVuY2VMaW5rID0gKGlucHV0LCBlZGl0b3IpIC0+XG4gIGxpbmsgPSBSRUZFUkVOQ0VfTElOS19SRUdFWC5leGVjKGlucHV0KVxuICB0ZXh0ID0gbGlua1syXSB8fCBsaW5rWzFdXG4gIGlkICAgPSBsaW5rWzNdIHx8IGxpbmtbMV1cblxuICAjIGZpbmQgZGVmaW5pdGlvbiBhbmQgZGVmaW5pdGlvblJhbmdlIGlmIGVkaXRvciBpcyBnaXZlblxuICBkZWYgID0gdW5kZWZpbmVkXG4gIGVkaXRvciAmJiBlZGl0b3IuYnVmZmVyLnNjYW4gUkVGRVJFTkNFX0RFRl9SRUdFWF9PRihpZCksIChtYXRjaCkgLT4gZGVmID0gbWF0Y2hcblxuICBpZiBkZWZcbiAgICBpZDogaWQsIHRleHQ6IHRleHQsIHVybDogZGVmLm1hdGNoWzJdLCB0aXRsZTogZGVmLm1hdGNoWzNdIHx8IFwiXCIsXG4gICAgZGVmaW5pdGlvblJhbmdlOiBkZWYucmFuZ2VcbiAgZWxzZVxuICAgIGlkOiBpZCwgdGV4dDogdGV4dCwgdXJsOiBcIlwiLCB0aXRsZTogXCJcIiwgZGVmaW5pdGlvblJhbmdlOiBudWxsXG5cbmlzUmVmZXJlbmNlRGVmaW5pdGlvbiA9IChpbnB1dCkgLT5cbiAgZGVmID0gUkVGRVJFTkNFX0RFRl9SRUdFWC5leGVjKGlucHV0KVxuICAhIWRlZiAmJiBkZWZbMV1bMF0gIT0gXCJeXCIgIyBub3QgYSBmb290bm90ZVxuXG5wYXJzZVJlZmVyZW5jZURlZmluaXRpb24gPSAoaW5wdXQsIGVkaXRvcikgLT5cbiAgZGVmICA9IFJFRkVSRU5DRV9ERUZfUkVHRVguZXhlYyhpbnB1dClcbiAgaWQgICA9IGRlZlsxXVxuXG4gICMgZmluZCBsaW5rIGFuZCBsaW5rUmFuZ2UgaWYgZWRpdG9yIGlzIGdpdmVuXG4gIGxpbmsgPSB1bmRlZmluZWRcbiAgZWRpdG9yICYmIGVkaXRvci5idWZmZXIuc2NhbiBSRUZFUkVOQ0VfTElOS19SRUdFWF9PRihpZCksIChtYXRjaCkgLT4gbGluayA9IG1hdGNoXG5cbiAgaWYgbGlua1xuICAgIGlkOiBpZCwgdGV4dDogbGluay5tYXRjaFsyXSB8fCBsaW5rLm1hdGNoWzFdLCB1cmw6IGRlZlsyXSxcbiAgICB0aXRsZTogZGVmWzNdIHx8IFwiXCIsIGxpbmtSYW5nZTogbGluay5yYW5nZVxuICBlbHNlXG4gICAgaWQ6IGlkLCB0ZXh0OiBcIlwiLCB1cmw6IGRlZlsyXSwgdGl0bGU6IGRlZlszXSB8fCBcIlwiLCBsaW5rUmFuZ2U6IG51bGxcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBGb290bm90ZVxuI1xuXG5GT09UTk9URV9SRUdFWCA9IC8vLyBcXFsgXFxeICguKz8pIFxcXSAoOik/IC8vL1xuRk9PVE5PVEVfVEVTVF9SRUdFWCA9IC8vL1xuICAje09QRU5fVEFHfVxuICAje0ZPT1ROT1RFX1JFR0VYLnNvdXJjZX1cbiAgLy8vXG5cbmlzRm9vdG5vdGUgPSAoaW5wdXQpIC0+IEZPT1ROT1RFX1RFU1RfUkVHRVgudGVzdChpbnB1dClcbnBhcnNlRm9vdG5vdGUgPSAoaW5wdXQpIC0+XG4gIGZvb3Rub3RlID0gRk9PVE5PVEVfUkVHRVguZXhlYyhpbnB1dClcbiAgbGFiZWw6IGZvb3Rub3RlWzFdLCBpc0RlZmluaXRpb246IGZvb3Rub3RlWzJdID09IFwiOlwiLCBjb250ZW50OiBcIlwiXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgVGFibGVcbiNcblxuVEFCTEVfU0VQQVJBVE9SX1JFR0VYID0gLy8vXG4gIF5cbiAgKFxcfCk/ICAgICAgICAgICAgICAgICMgc3RhcnRzIHdpdGggYW4gb3B0aW9uYWwgfFxuICAoXG4gICAoPzpcXHMqKD86LSt8Oi0qOnw6LSp8LSo6KVxccypcXHwpKyAgICAjIG9uZSBvciBtb3JlIHRhYmxlIGNlbGxcbiAgICg/OlxccyooPzotK3w6LSo6fDotKnwtKjopXFxzKnxcXHMrKSAgICMgbGFzdCB0YWJsZSBjZWxsLCBvciBlbXB0eSBjZWxsXG4gIClcbiAgKFxcfCk/ICAgICAgICAgICAgICAgICMgZW5kcyB3aXRoIGFuIG9wdGlvbmFsIHxcbiAgJFxuICAvLy9cblxuVEFCTEVfT05FX0NPTFVNTl9TRVBBUkFUT1JfUkVHRVggPSAvLy8gXiAoXFx8KSAoXFxzKjo/LSs6P1xccyopIChcXHwpICQgLy8vXG5cbmlzVGFibGVTZXBhcmF0b3IgPSAobGluZSkgLT5cbiAgVEFCTEVfU0VQQVJBVE9SX1JFR0VYLnRlc3QobGluZSkgfHxcbiAgICBUQUJMRV9PTkVfQ09MVU1OX1NFUEFSQVRPUl9SRUdFWC50ZXN0KGxpbmUpXG5cbnBhcnNlVGFibGVTZXBhcmF0b3IgPSAobGluZSkgLT5cbiAgbWF0Y2hlcyA9IFRBQkxFX1NFUEFSQVRPUl9SRUdFWC5leGVjKGxpbmUpIHx8XG4gICAgVEFCTEVfT05FX0NPTFVNTl9TRVBBUkFUT1JfUkVHRVguZXhlYyhsaW5lKVxuICBleHRyYVBpcGVzID0gISEobWF0Y2hlc1sxXSB8fCBtYXRjaGVzW21hdGNoZXMubGVuZ3RoIC0gMV0pXG4gIGNvbHVtbnMgPSBtYXRjaGVzWzJdLnNwbGl0KFwifFwiKS5tYXAgKGNvbCkgLT4gY29sLnRyaW0oKVxuXG4gIHJldHVybiB7XG4gICAgc2VwYXJhdG9yOiB0cnVlXG4gICAgZXh0cmFQaXBlczogZXh0cmFQaXBlc1xuICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICBjb2x1bW5XaWR0aHM6IGNvbHVtbnMubWFwIChjb2wpIC0+IGNvbC5sZW5ndGhcbiAgICBhbGlnbm1lbnRzOiBjb2x1bW5zLm1hcCAoY29sKSAtPlxuICAgICAgaGVhZCA9IGNvbFswXSA9PSBcIjpcIlxuICAgICAgdGFpbCA9IGNvbFtjb2wubGVuZ3RoIC0gMV0gPT0gXCI6XCJcblxuICAgICAgaWYgaGVhZCAmJiB0YWlsXG4gICAgICAgIFwiY2VudGVyXCJcbiAgICAgIGVsc2UgaWYgaGVhZFxuICAgICAgICBcImxlZnRcIlxuICAgICAgZWxzZSBpZiB0YWlsXG4gICAgICAgIFwicmlnaHRcIlxuICAgICAgZWxzZVxuICAgICAgICBcImVtcHR5XCJcbiAgfVxuXG5UQUJMRV9ST1dfUkVHRVggPSAvLy9cbiAgXlxuICAoXFx8KT8gICAgICAgICAgICAgICAgIyBzdGFydHMgd2l0aCBhbiBvcHRpb25hbCB8XG4gICguKz9cXHwuKz8pICAgICAgICAgICAjIGFueSBjb250ZW50IHdpdGggYXQgbGVhc3QgMiBjb2x1bW5zXG4gIChcXHwpPyAgICAgICAgICAgICAgICAjIGVuZHMgd2l0aCBhbiBvcHRpb25hbCB8XG4gICRcbiAgLy8vXG5cblRBQkxFX09ORV9DT0xVTU5fUk9XX1JFR0VYID0gLy8vIF4gKFxcfCkgKC4rPykgKFxcfCkgJCAvLy9cblxuaXNUYWJsZVJvdyA9IChsaW5lKSAtPlxuICBUQUJMRV9ST1dfUkVHRVgudGVzdChsaW5lKSB8fCBUQUJMRV9PTkVfQ09MVU1OX1JPV19SRUdFWC50ZXN0KGxpbmUpXG5cbnBhcnNlVGFibGVSb3cgPSAobGluZSkgLT5cbiAgcmV0dXJuIHBhcnNlVGFibGVTZXBhcmF0b3IobGluZSkgaWYgaXNUYWJsZVNlcGFyYXRvcihsaW5lKVxuXG4gIG1hdGNoZXMgPSBUQUJMRV9ST1dfUkVHRVguZXhlYyhsaW5lKSB8fCBUQUJMRV9PTkVfQ09MVU1OX1JPV19SRUdFWC5leGVjKGxpbmUpXG4gIGV4dHJhUGlwZXMgPSAhIShtYXRjaGVzWzFdIHx8IG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGggLSAxXSlcbiAgY29sdW1ucyA9IG1hdGNoZXNbMl0uc3BsaXQoXCJ8XCIpLm1hcCAoY29sKSAtPiBjb2wudHJpbSgpXG5cbiAgcmV0dXJuIHtcbiAgICBzZXBhcmF0b3I6IGZhbHNlXG4gICAgZXh0cmFQaXBlczogZXh0cmFQaXBlc1xuICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICBjb2x1bW5XaWR0aHM6IGNvbHVtbnMubWFwIChjb2wpIC0+IHdjc3dpZHRoKGNvbClcbiAgfVxuXG4jIGRlZmF1bHRzOlxuIyAgIG51bU9mQ29sdW1uczogM1xuIyAgIGNvbHVtbldpZHRoOiAzXG4jICAgY29sdW1uV2lkdGhzOiBbXVxuIyAgIGV4dHJhUGlwZXM6IHRydWVcbiMgICBhbGlnbm1lbnQ6IFwibGVmdFwiIHwgXCJyaWdodFwiIHwgXCJjZW50ZXJcIiB8IFwiZW1wdHlcIlxuIyAgIGFsaWdubWVudHM6IFtdXG5jcmVhdGVUYWJsZVNlcGFyYXRvciA9IChvcHRpb25zKSAtPlxuICBvcHRpb25zLmNvbHVtbldpZHRocyA/PSBbXVxuICBvcHRpb25zLmFsaWdubWVudHMgPz0gW11cblxuICByb3cgPSBbXVxuICBmb3IgaSBpbiBbMC4ub3B0aW9ucy5udW1PZkNvbHVtbnMgLSAxXVxuICAgIGNvbHVtbldpZHRoID0gb3B0aW9ucy5jb2x1bW5XaWR0aHNbaV0gfHwgb3B0aW9ucy5jb2x1bW5XaWR0aFxuXG4gICAgIyBlbXB0eSBzcGFjZXMgd2lsbCBiZSBpbnNlcnRlZCB3aGVuIGpvaW4gcGlwZXMsIHNvIG5lZWQgdG8gY29tcGVuc2F0ZSBoZXJlXG4gICAgaWYgIW9wdGlvbnMuZXh0cmFQaXBlcyAmJiAoaSA9PSAwIHx8IGkgPT0gb3B0aW9ucy5udW1PZkNvbHVtbnMgLSAxKVxuICAgICAgY29sdW1uV2lkdGggKz0gMVxuICAgIGVsc2VcbiAgICAgIGNvbHVtbldpZHRoICs9IDJcblxuICAgIHN3aXRjaCBvcHRpb25zLmFsaWdubWVudHNbaV0gfHwgb3B0aW9ucy5hbGlnbm1lbnRcbiAgICAgIHdoZW4gXCJjZW50ZXJcIlxuICAgICAgICByb3cucHVzaChcIjpcIiArIFwiLVwiLnJlcGVhdChjb2x1bW5XaWR0aCAtIDIpICsgXCI6XCIpXG4gICAgICB3aGVuIFwibGVmdFwiXG4gICAgICAgIHJvdy5wdXNoKFwiOlwiICsgXCItXCIucmVwZWF0KGNvbHVtbldpZHRoIC0gMSkpXG4gICAgICB3aGVuIFwicmlnaHRcIlxuICAgICAgICByb3cucHVzaChcIi1cIi5yZXBlYXQoY29sdW1uV2lkdGggLSAxKSArIFwiOlwiKVxuICAgICAgZWxzZVxuICAgICAgICByb3cucHVzaChcIi1cIi5yZXBlYXQoY29sdW1uV2lkdGgpKVxuXG4gIHJvdyA9IHJvdy5qb2luKFwifFwiKVxuICBpZiBvcHRpb25zLmV4dHJhUGlwZXMgdGhlbiBcInwje3Jvd318XCIgZWxzZSByb3dcblxuIyBjb2x1bW5zOiBbdmFsdWVzXVxuIyBkZWZhdWx0czpcbiMgICBudW1PZkNvbHVtbnM6IDNcbiMgICBjb2x1bW5XaWR0aDogM1xuIyAgIGNvbHVtbldpZHRoczogW11cbiMgICBleHRyYVBpcGVzOiB0cnVlXG4jICAgYWxpZ25tZW50OiBcImxlZnRcIiB8IFwicmlnaHRcIiB8IFwiY2VudGVyXCIgfCBcImVtcHR5XCJcbiMgICBhbGlnbm1lbnRzOiBbXVxuY3JlYXRlVGFibGVSb3cgPSAoY29sdW1ucywgb3B0aW9ucykgLT5cbiAgb3B0aW9ucy5jb2x1bW5XaWR0aHMgPz0gW11cbiAgb3B0aW9ucy5hbGlnbm1lbnRzID89IFtdXG5cbiAgcm93ID0gW11cbiAgZm9yIGkgaW4gWzAuLm9wdGlvbnMubnVtT2ZDb2x1bW5zIC0gMV1cbiAgICBjb2x1bW5XaWR0aCA9IG9wdGlvbnMuY29sdW1uV2lkdGhzW2ldIHx8IG9wdGlvbnMuY29sdW1uV2lkdGhcblxuICAgIGlmICFjb2x1bW5zW2ldXG4gICAgICByb3cucHVzaChcIiBcIi5yZXBlYXQoY29sdW1uV2lkdGgpKVxuICAgICAgY29udGludWVcblxuICAgIGxlbiA9IGNvbHVtbldpZHRoIC0gd2Nzd2lkdGgoY29sdW1uc1tpXSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2x1bW4gd2lkdGggI3tjb2x1bW5XaWR0aH0gLSB3Y3N3aWR0aCgnI3tjb2x1bW5zW2ldfScpIGNhbm5vdCBiZSAje2xlbn1cIikgaWYgbGVuIDwgMFxuXG4gICAgc3dpdGNoIG9wdGlvbnMuYWxpZ25tZW50c1tpXSB8fCBvcHRpb25zLmFsaWdubWVudFxuICAgICAgd2hlbiBcImNlbnRlclwiXG4gICAgICAgIHJvdy5wdXNoKFwiIFwiLnJlcGVhdChsZW4gLyAyKSArIGNvbHVtbnNbaV0gKyBcIiBcIi5yZXBlYXQoKGxlbiArIDEpIC8gMikpXG4gICAgICB3aGVuIFwibGVmdFwiXG4gICAgICAgIHJvdy5wdXNoKGNvbHVtbnNbaV0gKyBcIiBcIi5yZXBlYXQobGVuKSlcbiAgICAgIHdoZW4gXCJyaWdodFwiXG4gICAgICAgIHJvdy5wdXNoKFwiIFwiLnJlcGVhdChsZW4pICsgY29sdW1uc1tpXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcm93LnB1c2goY29sdW1uc1tpXSArIFwiIFwiLnJlcGVhdChsZW4pKVxuXG4gIHJvdyA9IHJvdy5qb2luKFwiIHwgXCIpXG4gIGlmIG9wdGlvbnMuZXh0cmFQaXBlcyB0aGVuIFwifCAje3Jvd30gfFwiIGVsc2Ugcm93XG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgVVJMXG4jXG5cblVSTF9SRUdFWCA9IC8vL1xuICBeXG4gICg/Olxcdys6KT9cXC9cXC8gICAgICAgICAgICAgICAgICAgICAgICMgYW55IHByZWZpeCwgZS5nLiBodHRwOi8vXG4gIChbXlxcc1xcLl0rXFwuXFxTezJ9fGxvY2FsaG9zdFtcXDo/XFxkXSopICMgc29tZSBkb21haW5cbiAgXFxTKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcGF0aFxuICAkXG4gIC8vL2lcblxuaXNVcmwgPSAodXJsKSAtPiBVUkxfUkVHRVgudGVzdCh1cmwpXG5cbiMgTm9ybWFsaXplIGEgZmlsZSBwYXRoIHRvIFVSTCBzZXBhcmF0b3Jcbm5vcm1hbGl6ZUZpbGVQYXRoID0gKHBhdGgpIC0+IHBhdGguc3BsaXQoL1tcXFxcXFwvXS8pLmpvaW4oJy8nKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEF0b20gVGV4dEVkaXRvclxuI1xuXG4jIFJldHVybiBzY29wZVNlbGVjdG9yIGlmIHRoZXJlIGlzIGFuIGV4YWN0IG1hdGNoLFxuIyBlbHNlIHJldHVybiBhbnkgc2NvcGUgZGVzY3JpcHRvciBjb250YWlucyBzY29wZVNlbGVjdG9yXG5nZXRTY29wZURlc2NyaXB0b3IgPSAoY3Vyc29yLCBzY29wZVNlbGVjdG9yKSAtPlxuICBzY29wZXMgPSBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKClcbiAgICAuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIC5maWx0ZXIoKHNjb3BlKSAtPiBzY29wZS5pbmRleE9mKHNjb3BlU2VsZWN0b3IpID49IDApXG5cbiAgaWYgc2NvcGVzLmluZGV4T2Yoc2NvcGVTZWxlY3RvcikgPj0gMFxuICAgIHJldHVybiBzY29wZVNlbGVjdG9yXG4gIGVsc2UgaWYgc2NvcGVzLmxlbmd0aCA+IDBcbiAgICByZXR1cm4gc2NvcGVzWzBdXG5cbmdldEJ1ZmZlclJhbmdlRm9yU2NvcGUgPSAoZWRpdG9yLCBjdXJzb3IsIHNjb3BlU2VsZWN0b3IpIC0+XG4gIHBvcyA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgcmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVTZWxlY3RvciwgcG9zKVxuICByZXR1cm4gcmFuZ2UgaWYgcmFuZ2VcblxuICAjIEF0b20gQnVnIDE6IG5vdCByZXR1cm5pbmcgdGhlIGNvcnJlY3QgYnVmZmVyIHJhbmdlIHdoZW4gY3Vyc29yIGlzIGF0IHRoZSBlbmQgb2YgYSBsaW5rIHdpdGggc2NvcGUsXG4gICMgcmVmZXIgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNzk2MVxuICAjXG4gICMgSEFDSyBtb3ZlIHRoZSBjdXJzb3IgcG9zaXRpb24gb25lIGNoYXIgYmFja3dhcmQsIGFuZCB0cnkgdG8gZ2V0IHRoZSBidWZmZXIgcmFuZ2UgZm9yIHNjb3BlIGFnYWluXG4gIHVubGVzcyBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgcmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVTZWxlY3RvciwgW3Bvcy5yb3csIHBvcy5jb2x1bW4gLSAxXSlcbiAgICByZXR1cm4gcmFuZ2UgaWYgcmFuZ2VcblxuICAjIEF0b20gQnVnIDI6IG5vdCByZXR1cm5pbmcgdGhlIGNvcnJlY3QgYnVmZmVyIHJhbmdlIHdoZW4gY3Vyc29yIGlzIGF0IHRoZSBoZWFkIG9mIGEgbGlzdCBsaW5rIHdpdGggc2NvcGUsXG4gICMgcmVmZXIgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTI3MTRcbiAgI1xuICAjIEhBQ0sgbW92ZSB0aGUgY3Vyc29yIHBvc2l0aW9uIG9uZSBjaGFyIGZvcndhcmQsIGFuZCB0cnkgdG8gZ2V0IHRoZSBidWZmZXIgcmFuZ2UgZm9yIHNjb3BlIGFnYWluXG4gIHVubGVzcyBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgcmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVTZWxlY3RvciwgW3Bvcy5yb3csIHBvcy5jb2x1bW4gKyAxXSlcbiAgICByZXR1cm4gcmFuZ2UgaWYgcmFuZ2VcblxuIyBHZXQgdGhlIHRleHQgYnVmZmVyIHJhbmdlIGlmIHNlbGVjdGlvbiBpcyBub3QgZW1wdHksIG9yIGdldCB0aGVcbiMgYnVmZmVyIHJhbmdlIGlmIGl0IGlzIGluc2lkZSBhIHNjb3BlIHNlbGVjdG9yLCBvciB0aGUgY3VycmVudCB3b3JkLlxuI1xuIyBzZWxlY3Rpb246IG9wdGlvbmFsLCB3aGVuIG5vdCBwcm92aWRlZCBvciBlbXB0eSwgdXNlIHRoZSBsYXN0IHNlbGVjdGlvblxuIyBvcHRzW1wic2VsZWN0QnlcIl06XG4jICAtIG5vcGU6IGRvIG5vdCB1c2UgYW55IHNlbGVjdCBieVxuIyAgLSBuZWFyZXN0V29yZDogdHJ5IHNlbGVjdCBuZWFyZXN0IHdvcmQsIGRlZmF1bHRcbiMgIC0gY3VycmVudExpbmU6IHRyeSBzZWxlY3QgY3VycmVudCBsaW5lXG5nZXRUZXh0QnVmZmVyUmFuZ2UgPSAoZWRpdG9yLCBzY29wZVNlbGVjdG9yLCBzZWxlY3Rpb24sIG9wdHMgPSB7fSkgLT5cbiAgaWYgdHlwZW9mKHNlbGVjdGlvbikgPT0gXCJvYmplY3RcIlxuICAgIG9wdHMgPSBzZWxlY3Rpb25cbiAgICBzZWxlY3Rpb24gPSB1bmRlZmluZWRcblxuICBzZWxlY3Rpb24gPz0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICBjdXJzb3IgPSBzZWxlY3Rpb24uY3Vyc29yXG4gIHNlbGVjdEJ5ID0gb3B0c1tcInNlbGVjdEJ5XCJdIHx8IFwibmVhcmVzdFdvcmRcIlxuXG4gIGlmIHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICBlbHNlIGlmIHNjb3BlID0gZ2V0U2NvcGVEZXNjcmlwdG9yKGN1cnNvciwgc2NvcGVTZWxlY3RvcilcbiAgICBnZXRCdWZmZXJSYW5nZUZvclNjb3BlKGVkaXRvciwgY3Vyc29yLCBzY29wZSlcbiAgZWxzZSBpZiBzZWxlY3RCeSA9PSBcIm5lYXJlc3RXb3JkXCJcbiAgICB3b3JkUmVnZXggPSBjdXJzb3Iud29yZFJlZ0V4cChpbmNsdWRlTm9uV29yZENoYXJhY3RlcnM6IGZhbHNlKVxuICAgIGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKHdvcmRSZWdleDogd29yZFJlZ2V4KVxuICBlbHNlIGlmIHNlbGVjdEJ5ID09IFwiY3VycmVudExpbmVcIlxuICAgIGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKClcbiAgZWxzZVxuICAgIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiMgRmluZCBhIHBvc3NpYmxlIGxpbmsgdGFnIGluIHRoZSByYW5nZSBmcm9tIGVkaXRvciwgcmV0dXJuIHRoZSBmb3VuZCBsaW5rIGRhdGEgb3IgbmlsXG4jXG4jIERhdGEgZm9ybWF0OiB7IHRleHQ6IFwiXCIsIHVybDogXCJcIiwgdGl0bGU6IFwiXCIsIGlkOiBudWxsLCBsaW5rUmFuZ2U6IG51bGwsIGRlZmluaXRpb25SYW5nZTogbnVsbCB9XG4jXG4jIE5PVEU6IElmIGlkIGlzIG5vdCBudWxsLCBhbmQgYW55IG9mIGxpbmtSYW5nZS9kZWZpbml0aW9uUmFuZ2UgaXMgbnVsbCwgaXQgbWVhbnMgdGhlIGxpbmsgaXMgYW4gb3JwaGFuXG5maW5kTGlua0luUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgc2VsZWN0aW9uID0gZWRpdG9yLmdldFRleHRJblJhbmdlKHJhbmdlKVxuICByZXR1cm4gaWYgc2VsZWN0aW9uID09IFwiXCJcblxuICByZXR1cm4gdGV4dDogXCJcIiwgdXJsOiBzZWxlY3Rpb24sIHRpdGxlOiBcIlwiIGlmIGlzVXJsKHNlbGVjdGlvbilcbiAgcmV0dXJuIHBhcnNlSW5saW5lTGluayhzZWxlY3Rpb24pIGlmIGlzSW5saW5lTGluayhzZWxlY3Rpb24pXG5cbiAgaWYgaXNSZWZlcmVuY2VMaW5rKHNlbGVjdGlvbilcbiAgICBsaW5rID0gcGFyc2VSZWZlcmVuY2VMaW5rKHNlbGVjdGlvbiwgZWRpdG9yKVxuICAgIGxpbmsubGlua1JhbmdlID0gcmFuZ2VcbiAgICByZXR1cm4gbGlua1xuICBlbHNlIGlmIGlzUmVmZXJlbmNlRGVmaW5pdGlvbihzZWxlY3Rpb24pXG4gICAgIyBIQUNLIGNvcnJlY3QgdGhlIGRlZmluaXRpb24gcmFuZ2UsIEF0b20ncyBsaW5rIHNjb3BlIGRvZXMgbm90IGluY2x1ZGVcbiAgICAjIGRlZmluaXRpb24ncyB0aXRsZSwgc28gbm9ybWFsaXplIHRvIGJlIHRoZSByYW5nZSBzdGFydCByb3dcbiAgICBzZWxlY3Rpb24gPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93KVxuICAgIHJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdylcblxuICAgIGxpbmsgPSBwYXJzZVJlZmVyZW5jZURlZmluaXRpb24oc2VsZWN0aW9uLCBlZGl0b3IpXG4gICAgbGluay5kZWZpbml0aW9uUmFuZ2UgPSByYW5nZVxuICAgIHJldHVybiBsaW5rXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgRXhwb3J0c1xuI1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldEpTT046IGdldEpTT05cbiAgZXNjYXBlUmVnRXhwOiBlc2NhcGVSZWdFeHBcbiAgY2FwaXRhbGl6ZTogY2FwaXRhbGl6ZVxuICBpc1VwcGVyQ2FzZTogaXNVcHBlckNhc2VcbiAgaW5jcmVtZW50Q2hhcnM6IGluY3JlbWVudENoYXJzXG4gIHNsdWdpemU6IHNsdWdpemVcbiAgbm9ybWFsaXplRmlsZVBhdGg6IG5vcm1hbGl6ZUZpbGVQYXRoXG5cbiAgZ2V0UGFja2FnZVBhdGg6IGdldFBhY2thZ2VQYXRoXG4gIGdldFByb2plY3RQYXRoOiBnZXRQcm9qZWN0UGF0aFxuICBnZXRTaXRlUGF0aDogZ2V0U2l0ZVBhdGhcbiAgZ2V0SG9tZWRpcjogZ2V0SG9tZWRpclxuICBnZXRBYnNvbHV0ZVBhdGg6IGdldEFic29sdXRlUGF0aFxuXG4gIHNldFRhYkluZGV4OiBzZXRUYWJJbmRleFxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB1bnRlbXBsYXRlOiB1bnRlbXBsYXRlXG5cbiAgZ2V0RGF0ZTogZ2V0RGF0ZVxuICBwYXJzZURhdGU6IHBhcnNlRGF0ZVxuXG4gIGlzSW1hZ2VUYWc6IGlzSW1hZ2VUYWdcbiAgcGFyc2VJbWFnZVRhZzogcGFyc2VJbWFnZVRhZ1xuICBpc0ltYWdlOiBpc0ltYWdlXG4gIHBhcnNlSW1hZ2U6IHBhcnNlSW1hZ2VcblxuICBzY2FuTGlua3M6IHNjYW5MaW5rc1xuICBpc0lubGluZUxpbms6IGlzSW5saW5lTGlua1xuICBwYXJzZUlubGluZUxpbms6IHBhcnNlSW5saW5lTGlua1xuICBpc1JlZmVyZW5jZUxpbms6IGlzUmVmZXJlbmNlTGlua1xuICBwYXJzZVJlZmVyZW5jZUxpbms6IHBhcnNlUmVmZXJlbmNlTGlua1xuICBpc1JlZmVyZW5jZURlZmluaXRpb246IGlzUmVmZXJlbmNlRGVmaW5pdGlvblxuICBwYXJzZVJlZmVyZW5jZURlZmluaXRpb246IHBhcnNlUmVmZXJlbmNlRGVmaW5pdGlvblxuXG4gIGlzRm9vdG5vdGU6IGlzRm9vdG5vdGVcbiAgcGFyc2VGb290bm90ZTogcGFyc2VGb290bm90ZVxuXG4gIGlzVGFibGVTZXBhcmF0b3I6IGlzVGFibGVTZXBhcmF0b3JcbiAgcGFyc2VUYWJsZVNlcGFyYXRvcjogcGFyc2VUYWJsZVNlcGFyYXRvclxuICBjcmVhdGVUYWJsZVNlcGFyYXRvcjogY3JlYXRlVGFibGVTZXBhcmF0b3JcbiAgaXNUYWJsZVJvdzogaXNUYWJsZVJvd1xuICBwYXJzZVRhYmxlUm93OiBwYXJzZVRhYmxlUm93XG4gIGNyZWF0ZVRhYmxlUm93OiBjcmVhdGVUYWJsZVJvd1xuXG4gIGlzVXJsOiBpc1VybFxuICBpc0ltYWdlRmlsZTogaXNJbWFnZUZpbGVcblxuICBnZXRUZXh0QnVmZmVyUmFuZ2U6IGdldFRleHRCdWZmZXJSYW5nZVxuICBmaW5kTGlua0luUmFuZ2U6IGZpbmRMaW5rSW5SYW5nZVxuIl19
