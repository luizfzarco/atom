
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.executables = [
      {
        name: "PHP",
        cmd: "php",
        homepage: "http://php.net/",
        installation: "http://php.net/manual/en/install.php",
        version: {
          parse: function(text) {
            return text.match(/PHP (\d+\.\d+\.\d+)/)[1];
          }
        }
      }, {
        name: "PHPCBF",
        cmd: "phpcbf",
        homepage: "https://github.com/squizlabs/PHP_CodeSniffer",
        installation: "https://github.com/squizlabs/PHP_CodeSniffer#installation",
        optional: true,
        version: {
          parse: function(text) {
            return text.match(/version (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/phpcbf"
        }
      }
    ];

    PHPCBF.prototype.options = {
      PHP: {
        phpcbf_path: true,
        phpcbf_version: true,
        standard: true
      }
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var php, phpcbf, standardFile, standardFiles;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      php = this.exe('php');
      phpcbf = this.exe('phpcbf');
      if (options.phpcbf_path) {
        this.deprecateOptionForExecutable("PHPCBF", "PHP - PHPCBF Path (phpcbf_path)", "Path");
      }
      return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, phpcbf.path(), this.tempFile("temp", text, ".php")]).then((function(_this) {
        return function(arg) {
          var customPhpcbfPath, finalPhpcbfPath, isPhpScript, isVersion3, phpcbfPath, tempFile;
          customPhpcbfPath = arg[0], phpcbfPath = arg[1], tempFile = arg[2];
          finalPhpcbfPath = customPhpcbfPath && path.isAbsolute(customPhpcbfPath) ? customPhpcbfPath : phpcbfPath;
          _this.verbose('finalPhpcbfPath', finalPhpcbfPath, phpcbfPath, customPhpcbfPath);
          isVersion3 = (phpcbf.isInstalled && phpcbf.isVersion('3.x')) || (options.phpcbf_version && phpcbf.versionSatisfies(options.phpcbf_version + ".0.0", '3.x'));
          isPhpScript = (finalPhpcbfPath.indexOf(".phar") !== -1) || (finalPhpcbfPath.indexOf(".php") !== -1);
          _this.verbose('isPhpScript', isPhpScript);
          if (isPhpScript) {
            return php.run([phpcbfPath, !isVersion3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile], {
              ignoreReturnCode: true,
              onStdin: function(stdin) {
                return stdin.end();
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return phpcbf.run([!isVersion3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text, ".php")], {
              ignoreReturnCode: true,
              onStdin: function(stdin) {
                return stdin.end();
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZmVsaXBlLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocGNiZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsd0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztxQkFDckIsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLEtBRFI7UUFFRSxHQUFBLEVBQUssS0FGUDtRQUdFLFFBQUEsRUFBVSxpQkFIWjtRQUlFLFlBQUEsRUFBYyxzQ0FKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcscUJBQVgsQ0FBa0MsQ0FBQSxDQUFBO1VBQTVDLENBREE7U0FMWDtPQURXLEVBVVg7UUFDRSxJQUFBLEVBQU0sUUFEUjtRQUVFLEdBQUEsRUFBSyxRQUZQO1FBR0UsUUFBQSxFQUFVLDhDQUhaO1FBSUUsWUFBQSxFQUFjLDJEQUpoQjtRQUtFLFFBQUEsRUFBVSxJQUxaO1FBTUUsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLHlCQUFYLENBQXNDLENBQUEsQ0FBQTtVQUFoRCxDQURBO1NBTlg7UUFTRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sb0JBREQ7U0FUVjtPQVZXOzs7cUJBeUJiLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsY0FBQSxFQUFnQixJQURoQjtRQUVBLFFBQUEsRUFBVSxJQUZWO09BRks7OztxQkFPVCxR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Q0FBWCxFQUlLO2NBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7Y0FFRCxPQUFBLEVBQVMsU0FBQyxLQUFEO3VCQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7Y0FETyxDQUZSO2FBSkwsQ0FTRSxDQUFDLElBVEgsQ0FTUSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBVFIsRUFmRjs7UUFaTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKUjtJQWRROzs7O0tBbkMwQjtBQVJ0QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBIUENCRlwiXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUFwiXG4gICAgICBjbWQ6IFwicGhwXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHA6Ly9waHAubmV0L1wiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9QSFAgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgIH1cbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUENCRlwiXG4gICAgICBjbWQ6IFwicGhwY2JmXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlciNpbnN0YWxsYXRpb25cIlxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC92ZXJzaW9uIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICAgIGRvY2tlcjoge1xuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9waHBjYmZcIlxuICAgICAgfVxuICAgIH1cbiAgXVxuXG4gIG9wdGlvbnM6IHtcbiAgICBQSFA6XG4gICAgICBwaHBjYmZfcGF0aDogdHJ1ZVxuICAgICAgcGhwY2JmX3ZlcnNpb246IHRydWVcbiAgICAgIHN0YW5kYXJkOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBkZWJ1ZygncGhwY2JmJywgb3B0aW9ucylcbiAgICBzdGFuZGFyZEZpbGVzID0gWydwaHBjcy54bWwnLCAncGhwY3MueG1sLmRpc3QnLCAncGhwY3MucnVsZXNldC54bWwnLCAncnVsZXNldC54bWwnXVxuICAgIHN0YW5kYXJkRmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgc3RhbmRhcmRGaWxlcylcblxuICAgIG9wdGlvbnMuc3RhbmRhcmQgPSBzdGFuZGFyZEZpbGUgaWYgc3RhbmRhcmRGaWxlXG5cbiAgICBwaHAgPSBAZXhlKCdwaHAnKVxuICAgIHBocGNiZiA9IEBleGUoJ3BocGNiZicpXG5cbiAgICBpZiBvcHRpb25zLnBocGNiZl9wYXRoXG4gICAgICBAZGVwcmVjYXRlT3B0aW9uRm9yRXhlY3V0YWJsZShcIlBIUENCRlwiLCBcIlBIUCAtIFBIUENCRiBQYXRoIChwaHBjYmZfcGF0aClcIiwgXCJQYXRoXCIpXG5cbiAgICAjIEZpbmQgcGhwY2JmLnBoYXIgc2NyaXB0XG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLnBocGNiZl9wYXRoKSBpZiBvcHRpb25zLnBocGNiZl9wYXRoXG4gICAgICBwaHBjYmYucGF0aCgpXG4gICAgICBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsIFwiLnBocFwiKVxuICAgIF0pLnRoZW4oKFtjdXN0b21QaHBjYmZQYXRoLCBwaHBjYmZQYXRoLCB0ZW1wRmlsZV0pID0+XG4gICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgZmluYWxQaHBjYmZQYXRoID0gaWYgY3VzdG9tUGhwY2JmUGF0aCBhbmQgcGF0aC5pc0Fic29sdXRlKGN1c3RvbVBocGNiZlBhdGgpIHRoZW4gXFxcbiAgICAgICAgY3VzdG9tUGhwY2JmUGF0aCBlbHNlIHBocGNiZlBhdGhcbiAgICAgIEB2ZXJib3NlKCdmaW5hbFBocGNiZlBhdGgnLCBmaW5hbFBocGNiZlBhdGgsIHBocGNiZlBhdGgsIGN1c3RvbVBocGNiZlBhdGgpXG5cbiAgICAgIGlzVmVyc2lvbjMgPSAoKHBocGNiZi5pc0luc3RhbGxlZCBhbmQgcGhwY2JmLmlzVmVyc2lvbignMy54JykpIG9yIFxcXG4gICAgICAgIChvcHRpb25zLnBocGNiZl92ZXJzaW9uIGFuZCBwaHBjYmYudmVyc2lvblNhdGlzZmllcyhcIiN7b3B0aW9ucy5waHBjYmZfdmVyc2lvbn0uMC4wXCIsICczLngnKSkpXG5cbiAgICAgIGlzUGhwU2NyaXB0ID0gKGZpbmFsUGhwY2JmUGF0aC5pbmRleE9mKFwiLnBoYXJcIikgaXNudCAtMSkgb3IgKGZpbmFsUGhwY2JmUGF0aC5pbmRleE9mKFwiLnBocFwiKSBpc250IC0xKVxuICAgICAgQHZlcmJvc2UoJ2lzUGhwU2NyaXB0JywgaXNQaHBTY3JpcHQpXG5cbiAgICAgIGlmIGlzUGhwU2NyaXB0XG4gICAgICAgIHBocC5ydW4oW1xuICAgICAgICAgIHBocGNiZlBhdGgsXG4gICAgICAgICAgXCItLW5vLXBhdGNoXCIgdW5sZXNzIGlzVmVyc2lvbjNcbiAgICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgICB0ZW1wRmlsZVxuICAgICAgICAgIF0sIHtcbiAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBwaHBjYmYucnVuKFtcbiAgICAgICAgICBcIi0tbm8tcGF0Y2hcIiB1bmxlc3MgaXNWZXJzaW9uM1xuICAgICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0LCBcIi5waHBcIilcbiAgICAgICAgICBdLCB7XG4gICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgIClcbiAgICAgIClcbiJdfQ==
