(function() {
  var BLOCKQUOTE_REGEX, LIST_AL_REGEX, LIST_AL_TASK_REGEX, LIST_OL_REGEX, LIST_OL_TASK_REGEX, LIST_UL_REGEX, LIST_UL_TASK_REGEX, LineMeta, TYPES, incStr, utils;

  utils = require("../utils");

  LIST_UL_TASK_REGEX = /^(\s*)([*+-\.])\s+\[[xX ]\](?:\s+(.*))?$/;

  LIST_UL_REGEX = /^(\s*)([*+-\.])(?:\s+(.*))?$/;

  LIST_OL_TASK_REGEX = /^(\s*)(\d+)([\.\)])\s+\[[xX ]\](?:\s+(.*))?$/;

  LIST_OL_REGEX = /^(\s*)(\d+)([\.\)])(?:\s+(.*))?$/;

  LIST_AL_TASK_REGEX = /^(\s*)([a-zA-Z]{1,2})([\.\)])\s+\[[xX ]\](?:\s+(.*))?$/;

  LIST_AL_REGEX = /^(\s*)([a-zA-Z]{1,2})([\.\)])(?:\s+(.*))?$/;

  BLOCKQUOTE_REGEX = /^(\s*)(>)(?:\s+(.*))?$/;

  incStr = function(str) {
    var num;
    num = parseInt(str, 10);
    if (isNaN(num)) {
      return utils.incrementChars(str);
    } else {
      return num + 1;
    }
  };

  TYPES = [
    {
      name: ["list", "ul", "task"],
      regex: LIST_UL_TASK_REGEX,
      lineHead: function(indent, head, suffix) {
        return "" + indent + head + " [ ] ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ul"],
      regex: LIST_UL_REGEX,
      lineHead: function(indent, head, suffix) {
        return "" + indent + head + " ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ol", "task"],
      regex: LIST_OL_TASK_REGEX,
      lineHead: function(indent, head, suffix) {
        return "" + indent + head + suffix + " [ ] ";
      },
      nextLine: function(indent, head, suffix) {
        return "" + indent + (incStr(head)) + suffix + " [ ] ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol"],
      regex: LIST_OL_REGEX,
      lineHead: function(indent, head, suffix) {
        return "" + indent + head + suffix + " ";
      },
      nextLine: function(indent, head, suffix) {
        return "" + indent + (incStr(head)) + suffix + " ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol", "al", "task"],
      regex: LIST_AL_TASK_REGEX,
      lineHead: function(indent, head, suffix) {
        return "" + indent + head + suffix + " [ ] ";
      },
      nextLine: function(indent, head, suffix) {
        return "" + indent + (incStr(head)) + suffix + " [ ] ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["list", "ol", "al"],
      regex: LIST_AL_REGEX,
      lineHead: function(indent, head, suffix) {
        return "" + indent + head + suffix + " ";
      },
      nextLine: function(indent, head, suffix) {
        return "" + indent + (incStr(head)) + suffix + " ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["blockquote"],
      regex: BLOCKQUOTE_REGEX,
      lineHead: function(indent, head, suffix) {
        return indent + "> ";
      },
      defaultHead: function(head) {
        return ">";
      }
    }
  ];

  module.exports = LineMeta = (function() {
    function LineMeta(line) {
      this.line = line;
      this.type = void 0;
      this.head = "";
      this.defaultHead = "";
      this.body = "";
      this.indent = "";
      this.nextLine = "";
      this._findMeta();
    }

    LineMeta.prototype._findMeta = function() {
      var i, len, matches, results, type;
      results = [];
      for (i = 0, len = TYPES.length; i < len; i++) {
        type = TYPES[i];
        if (matches = type.regex.exec(this.line)) {
          this.type = type;
          this.indent = matches[1];
          this.head = matches[2];
          this.defaultHead = type.defaultHead(matches[2]);
          this.suffix = matches.length >= 4 ? matches[3] : "";
          this.body = matches[matches.length - 1] || "";
          this.nextLine = (type.nextLine || type.lineHead).call(null, this.indent, this.head, this.suffix);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    LineMeta.prototype.lineHead = function(head) {
      return this.type.lineHead(this.indent, head, this.suffix);
    };

    LineMeta.prototype.isTaskList = function() {
      return !!this.type && this.type.name.indexOf("task") !== -1;
    };

    LineMeta.prototype.isList = function(type) {
      return !!this.type && this.type.name.indexOf("list") !== -1 && (!type || this.type.name.indexOf(type) !== -1);
    };

    LineMeta.prototype.isContinuous = function() {
      return !!this.nextLine;
    };

    LineMeta.prototype.isEmptyBody = function() {
      return !this.body;
    };

    LineMeta.prototype.isIndented = function() {
      return !!this.indent && this.indent.length > 0;
    };

    LineMeta.isList = function(line) {
      return LIST_UL_REGEX.test(line) || LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isOrderedList = function(line) {
      return LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isUnorderedList = function(line) {
      return LIST_UL_REGEX.test(line);
    };

    LineMeta.incStr = incStr;

    return LineMeta;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZmVsaXBlLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvaGVscGVycy9saW5lLW1ldGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBRVIsa0JBQUEsR0FBcUI7O0VBQ3JCLGFBQUEsR0FBcUI7O0VBQ3JCLGtCQUFBLEdBQXFCOztFQUNyQixhQUFBLEdBQXFCOztFQUNyQixrQkFBQSxHQUFxQjs7RUFDckIsYUFBQSxHQUFxQjs7RUFDckIsZ0JBQUEsR0FBcUI7O0VBRXJCLE1BQUEsR0FBUyxTQUFDLEdBQUQ7QUFDUCxRQUFBO0lBQUEsR0FBQSxHQUFNLFFBQUEsQ0FBUyxHQUFULEVBQWMsRUFBZDtJQUNOLElBQUcsS0FBQSxDQUFNLEdBQU4sQ0FBSDthQUFtQixLQUFLLENBQUMsY0FBTixDQUFxQixHQUFyQixFQUFuQjtLQUFBLE1BQUE7YUFDSyxHQUFBLEdBQU0sRUFEWDs7RUFGTzs7RUFLVCxLQUFBLEdBQVE7SUFDTjtNQUNFLElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsTUFBZixDQURSO01BRUUsS0FBQSxFQUFPLGtCQUZUO01BR0UsUUFBQSxFQUFVLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxNQUFmO2VBQTBCLEVBQUEsR0FBRyxNQUFILEdBQVksSUFBWixHQUFpQjtNQUEzQyxDQUhaO01BSUUsV0FBQSxFQUFhLFNBQUMsSUFBRDtlQUFVO01BQVYsQ0FKZjtLQURNLEVBT047TUFDRSxJQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsSUFBVCxDQURSO01BRUUsS0FBQSxFQUFPLGFBRlQ7TUFHRSxRQUFBLEVBQVUsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLE1BQWY7ZUFBMEIsRUFBQSxHQUFHLE1BQUgsR0FBWSxJQUFaLEdBQWlCO01BQTNDLENBSFo7TUFJRSxX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QUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CLENBQUEsSUFBNEIsYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkI7SUFBdEM7O0lBQ2hCLFFBQUMsQ0FBQSxlQUFELEdBQWtCLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CO0lBQVY7O0lBQ2xCLFFBQUMsQ0FBQSxNQUFELEdBQVM7Ozs7O0FBMUdYIiwic291cmNlc0NvbnRlbnQiOlsidXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxuXG5MSVNUX1VMX1RBU0tfUkVHRVggPSAvLy8gXiAoXFxzKikgKFsqKy1cXC5dKSBcXHMrIFxcW1t4WFxcIF1cXF0gKD86XFxzKyAoLiopKT8gJCAvLy9cbkxJU1RfVUxfUkVHRVggICAgICA9IC8vLyBeIChcXHMqKSAoWyorLVxcLl0pICg/OlxccysgKC4qKSk/ICQgLy8vXG5MSVNUX09MX1RBU0tfUkVHRVggPSAvLy8gXiAoXFxzKikgKFxcZCspKFtcXC5cXCldKSBcXHMrIFxcW1t4WFxcIF1cXF0gKD86XFxzKyAoLiopKT8gJCAvLy9cbkxJU1RfT0xfUkVHRVggICAgICA9IC8vLyBeIChcXHMqKSAoXFxkKykoW1xcLlxcKV0pICg/OlxccysgKC4qKSk/ICQgLy8vXG5MSVNUX0FMX1RBU0tfUkVHRVggPSAvLy8gXiAoXFxzKikgKFthLXpBLVpdezEsMn0pKFtcXC5cXCldKSBcXHMrIFxcW1t4WFxcIF1cXF0gKD86XFxzKyAoLiopKT8gJCAvLy9cbkxJU1RfQUxfUkVHRVggICAgICA9IC8vLyBeIChcXHMqKSAoW2EtekEtWl17MSwyfSkoW1xcLlxcKV0pICg/OlxccysgKC4qKSk/ICQgLy8vXG5CTE9DS1FVT1RFX1JFR0VYICAgPSAvLy8gXiAoXFxzKikgKD4pICg/OlxccysgKC4qKSk/ICQgLy8vXG5cbmluY1N0ciA9IChzdHIpIC0+XG4gIG51bSA9IHBhcnNlSW50KHN0ciwgMTApXG4gIGlmIGlzTmFOKG51bSkgdGhlbiB1dGlscy5pbmNyZW1lbnRDaGFycyhzdHIpXG4gIGVsc2UgbnVtICsgMVxuXG5UWVBFUyA9IFtcbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJ1bFwiLCBcInRhc2tcIl0sXG4gICAgcmVnZXg6IExJU1RfVUxfVEFTS19SRUdFWCxcbiAgICBsaW5lSGVhZDogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aGVhZH0gWyBdIFwiXG4gICAgZGVmYXVsdEhlYWQ6IChoZWFkKSAtPiBoZWFkXG4gIH1cbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJ1bFwiXSxcbiAgICByZWdleDogTElTVF9VTF9SRUdFWCxcbiAgICBsaW5lSGVhZDogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aGVhZH0gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IGhlYWRcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcIm9sXCIsIFwidGFza1wiXSxcbiAgICByZWdleDogTElTVF9PTF9UQVNLX1JFR0VYLFxuICAgIGxpbmVIZWFkOiAoaW5kZW50LCBoZWFkLCBzdWZmaXgpIC0+IFwiI3tpbmRlbnR9I3toZWFkfSN7c3VmZml4fSBbIF0gXCJcbiAgICBuZXh0TGluZTogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aW5jU3RyKGhlYWQpfSN7c3VmZml4fSBbIF0gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IFwiMVwiXG4gIH1cbiAge1xuICAgIG5hbWU6IFtcImxpc3RcIiwgXCJvbFwiXSxcbiAgICByZWdleDogTElTVF9PTF9SRUdFWCxcbiAgICBsaW5lSGVhZDogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aGVhZH0je3N1ZmZpeH0gXCJcbiAgICBuZXh0TGluZTogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aW5jU3RyKGhlYWQpfSN7c3VmZml4fSBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT4gXCIxXCJcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcIm9sXCIsIFwiYWxcIiwgXCJ0YXNrXCJdLFxuICAgIHJlZ2V4OiBMSVNUX0FMX1RBU0tfUkVHRVgsXG4gICAgbGluZUhlYWQ6IChpbmRlbnQsIGhlYWQsIHN1ZmZpeCkgLT4gXCIje2luZGVudH0je2hlYWR9I3tzdWZmaXh9IFsgXSBcIlxuICAgIG5leHRMaW5lOiAoaW5kZW50LCBoZWFkLCBzdWZmaXgpIC0+IFwiI3tpbmRlbnR9I3tpbmNTdHIoaGVhZCl9I3tzdWZmaXh9IFsgXSBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT5cbiAgICAgIGMgPSBpZiB1dGlscy5pc1VwcGVyQ2FzZShoZWFkKSB0aGVuIFwiQVwiIGVsc2UgXCJhXCJcbiAgICAgIGhlYWQucmVwbGFjZSgvLi9nLCBjKVxuICB9XG4gIHtcbiAgICBuYW1lOiBbXCJsaXN0XCIsIFwib2xcIiwgXCJhbFwiXSxcbiAgICByZWdleDogTElTVF9BTF9SRUdFWCxcbiAgICBsaW5lSGVhZDogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aGVhZH0je3N1ZmZpeH0gXCJcbiAgICBuZXh0TGluZTogKGluZGVudCwgaGVhZCwgc3VmZml4KSAtPiBcIiN7aW5kZW50fSN7aW5jU3RyKGhlYWQpfSN7c3VmZml4fSBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT5cbiAgICAgIGMgPSBpZiB1dGlscy5pc1VwcGVyQ2FzZShoZWFkKSB0aGVuIFwiQVwiIGVsc2UgXCJhXCJcbiAgICAgIGhlYWQucmVwbGFjZSgvLi9nLCBjKVxuICB9XG4gIHtcbiAgICBuYW1lOiBbXCJibG9ja3F1b3RlXCJdLFxuICAgIHJlZ2V4OiBCTE9DS1FVT1RFX1JFR0VYLFxuICAgIGxpbmVIZWFkOiAoaW5kZW50LCBoZWFkLCBzdWZmaXgpIC0+IFwiI3tpbmRlbnR9PiBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT4gXCI+XCJcbiAgfVxuXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaW5lTWV0YVxuICBjb25zdHJ1Y3RvcjogKGxpbmUpIC0+XG4gICAgQGxpbmUgPSBsaW5lXG4gICAgQHR5cGUgPSB1bmRlZmluZWRcbiAgICBAaGVhZCA9IFwiXCJcbiAgICBAZGVmYXVsdEhlYWQgPSBcIlwiXG4gICAgQGJvZHkgPSBcIlwiXG4gICAgQGluZGVudCA9IFwiXCJcbiAgICBAbmV4dExpbmUgPSBcIlwiXG5cbiAgICBAX2ZpbmRNZXRhKClcblxuICBfZmluZE1ldGE6IC0+XG4gICAgZm9yIHR5cGUgaW4gVFlQRVNcbiAgICAgIGlmIG1hdGNoZXMgPSB0eXBlLnJlZ2V4LmV4ZWMoQGxpbmUpXG4gICAgICAgIEB0eXBlID0gdHlwZVxuICAgICAgICBAaW5kZW50ID0gbWF0Y2hlc1sxXVxuICAgICAgICBAaGVhZCA9IG1hdGNoZXNbMl1cbiAgICAgICAgQGRlZmF1bHRIZWFkID0gdHlwZS5kZWZhdWx0SGVhZChtYXRjaGVzWzJdKVxuICAgICAgICBAc3VmZml4ID0gaWYgbWF0Y2hlcy5sZW5ndGggPj0gNCB0aGVuIG1hdGNoZXNbM10gZWxzZSBcIlwiXG4gICAgICAgIEBib2R5ID0gbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aC0xXSB8fCBcIlwiXG4gICAgICAgIEBuZXh0TGluZSA9ICh0eXBlLm5leHRMaW5lIHx8IHR5cGUubGluZUhlYWQpLmNhbGwobnVsbCwgQGluZGVudCwgQGhlYWQsIEBzdWZmaXgpXG4gICAgICAgIGJyZWFrXG5cbiAgbGluZUhlYWQ6IChoZWFkKSAtPiBAdHlwZS5saW5lSGVhZChAaW5kZW50LCBoZWFkLCBAc3VmZml4KVxuXG4gIGlzVGFza0xpc3Q6IC0+ICEhQHR5cGUgJiYgQHR5cGUubmFtZS5pbmRleE9mKFwidGFza1wiKSAhPSAtMVxuICBpc0xpc3Q6ICh0eXBlKSAtPiAhIUB0eXBlICYmIEB0eXBlLm5hbWUuaW5kZXhPZihcImxpc3RcIikgIT0gLTEgJiYgKCF0eXBlIHx8IEB0eXBlLm5hbWUuaW5kZXhPZih0eXBlKSAhPSAtMSlcbiAgaXNDb250aW51b3VzOiAtPiAhIUBuZXh0TGluZVxuICBpc0VtcHR5Qm9keTogLT4gIUBib2R5XG4gIGlzSW5kZW50ZWQ6IC0+ICEhQGluZGVudCAmJiBAaW5kZW50Lmxlbmd0aCA+IDBcblxuICAjIFN0YXRpYyBtZXRob2RzXG5cbiAgQGlzTGlzdDogKGxpbmUpIC0+IExJU1RfVUxfUkVHRVgudGVzdChsaW5lKSB8fCBMSVNUX09MX1JFR0VYLnRlc3QobGluZSkgfHwgTElTVF9BTF9SRUdFWC50ZXN0KGxpbmUpXG4gIEBpc09yZGVyZWRMaXN0OiAobGluZSkgLT4gTElTVF9PTF9SRUdFWC50ZXN0KGxpbmUpIHx8IExJU1RfQUxfUkVHRVgudGVzdChsaW5lKVxuICBAaXNVbm9yZGVyZWRMaXN0OiAobGluZSkgLT4gTElTVF9VTF9SRUdFWC50ZXN0KGxpbmUpXG4gIEBpbmNTdHI6IGluY1N0clxuIl19
