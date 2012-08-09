(function() {

  $(function() {
    var canvas, cd, clear, clearUndefinedRules, gr, grid, height, loopColors, mainLoop, options, paint, pausebutton, plot, readLoopAndRules, reinit, rule, rules, run, running, seedLoop, setNextGeneration, startAction, started, steps, stepsLeft, stopAction, width;
    started = true;
    running = false;
    width = 600;
    height = 600;
    mainLoop = 0;
    rule = Array(9);
    options = {
      max: 100,
      fringe: 0,
      delay: 1,
      refreshSteps: 1
    };
    grid = Array(2);
    cd = 0;
    steps = 0;
    stepsLeft = 0;
    canvas = $("#gr").get();
    gr = $("#gr")[0].getContext("2d");
    loopColors = ["black", "#1f77b4", "#d62728", "#2ca02c", "#bcbd22", "#e377c2", "#e377c2", "#17becf", "#ff7f0e"];
    seedLoop = [' 22222222', '2170140142', '2022222202', '272    212', '212    212', '202    212', '272    212', '21222222122222', '207107107111112', ' 2222222222222'];
    rules = '000000 000012 000020 000030 000050 000063 000071 000112 000122 000132 000212 ' + '000220 000230 000262 000272 000320 000525 000622 000722 001022 001120 002020 ' + '002030 002050 002125 002220 002322 005222 012321 012421 012525 012621 012721 ' + '012751 014221 014321 014421 014721 016251 017221 017255 017521 017621 017721 ' + '025271 100011 100061 100077 100111 100121 100211 100244 100277 100511 101011 ' + '101111 101244 101277 102026 102121 102211 102244 102263 102277 102327 102424 ' + '102626 102644 102677 102710 102727 105427 111121 111221 111244 111251 111261 ' + '111277 111522 112121 112221 112244 112251 112277 112321 112424 112621 112727 ' + '113221 122244 122277 122434 122547 123244 123277 124255 124267 125275 200012 ' + '200022 200042 200071 200122 200152 200212 200222 200232 200242 200250 200262 ' + '200272 200326 200423 200517 200522 200575 200722 201022 201122 201222 201422 ' + '201722 202022 202032 202052 202073 202122 202152 202212 202222 202272 202321 ' + '202422 202452 202520 202552 202622 202722 203122 203216 203226 203422 204222 ' + '205122 205212 205222 205521 205725 206222 206722 207122 207222 207422 207722 ' + '211222 211261 212222 212242 212262 212272 214222 215222 216222 217222 222272 ' + '222442 222462 222762 222772 300013 300022 300041 300076 300123 300421 300622 ' + '301021 301220 302511 401120 401220 401250 402120 402221 402326 402520 403221 ' + '500022 500215 500225 500232 500272 500520 502022 502122 502152 502220 502244 ' + '502722 512122 512220 512422 512722 600011 600021 602120 612125 612131 612225 ' + '700077 701120 701220 701250 702120 702221 702251 702321 702525 702720 ';
    clearUndefinedRules = function() {
      var a, b, c, d, e;
      for (a = 0; a <= 8; a++) {
        for (b = 0; b <= 8; b++) {
          for (c = 0; c <= 8; c++) {
            for (d = 0; d <= 8; d++) {
              for (e = 0; e <= 8; e++) {
                if (rule[a][b][c][d][e] === -1) rule[a][b][c][d][e] = a;
              }
            }
          }
        }
      }
    };
    readLoopAndRules = function(loopLines, loopRules) {
      var b, c, i, j, l, len, loopLine, r, s, t, x, y, _i, _len, _ref, _ref2, _results;
      y = (options.max / 2) - 5;
      for (_i = 0, _len = loopLines.length; _i < _len; _i++) {
        loopLine = loopLines[_i];
        y++;
        x = (options.max / 2) - 5;
        for (j = 0, _ref = loopLine.length; 0 <= _ref ? j < _ref : j > _ref; 0 <= _ref ? j++ : j--) {
          x++;
          s = loopLine.substring(j, j + 1);
          if (s === " ") s = "0";
          grid[cd][x][y] = parseInt(s);
        }
      }
      _results = [];
      for (len = 0, _ref2 = loopRules.length; len < _ref2; len += 7) {
        c = parseInt(loopRules.substring(len, len + 1));
        t = parseInt(loopRules.substring(len + 1, len + 2));
        r = parseInt(loopRules.substring(len + 2, len + 3));
        b = parseInt(loopRules.substring(len + 3, len + 4));
        l = parseInt(loopRules.substring(len + 4, len + 5));
        i = parseInt(loopRules.substring(len + 5, len + 6));
        rule[c][t][r][b][l] = i;
        rule[c][l][t][r][b] = i;
        rule[c][b][l][t][r] = i;
        _results.push(rule[c][r][b][l][t] = i);
      }
      return _results;
    };
    setNextGeneration = function() {
      var X, Y, c, _ref, _ref2;
      c = grid[cd];
      for (X = 1, _ref = options.max - 1; 1 <= _ref ? X < _ref : X > _ref; 1 <= _ref ? X++ : X--) {
        for (Y = 1, _ref2 = options.max - 1; 1 <= _ref2 ? Y < _ref2 : Y > _ref2; 1 <= _ref2 ? Y++ : Y--) {
          grid[1 - cd][X][Y] = rule[c[X][Y]][c[X][Y - 1]][c[X + 1][Y]][c[X][Y + 1]][c[X - 1][Y]];
        }
      }
      return cd = 1 - cd;
    };
    clear = function() {
      gr.fillStyle = "#fff";
      return gr.fillRect(0, 0, canvas.width, canvas.height);
    };
    plot = function(x, y, w, h, color) {
      gr.fillStyle = color;
      return gr.fillRect(x, y, w, h);
    };
    paint = function() {
      var X, Y, b, color, fr, sq, _ref, _results;
      if (started) {
        clear();
        started = false;
      }
      sq = width / options.max;
      fr = options.fringe;
      b = sq + fr;
      _results = [];
      for (X = 0, _ref = options.max; 0 <= _ref ? X < _ref : X > _ref; 0 <= _ref ? X++ : X--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (Y = 0, _ref2 = options.max; 0 <= _ref2 ? Y < _ref2 : Y > _ref2; 0 <= _ref2 ? Y++ : Y--) {
            color = grid[cd][X][Y];
            _results2.push(plot(X * b, Y * b, sq, sq, loopColors[color]));
          }
          return _results2;
        })());
      }
      return _results;
    };
    pausebutton = $('#pause-button');
    reinit = function() {
      var a, b, c, d, e;
      steps = 0;
      $('#counter').text("0");
      stepsLeft = 0;
      cd = 0;
      running = false;
      started = true;
      for (a = 0; a <= 8; a++) {
        rule[a] = Array(9);
        for (b = 0; b <= 8; b++) {
          rule[a][b] = Array(9);
          for (c = 0; c <= 8; c++) {
            rule[a][b][c] = Array(9);
            for (d = 0; d <= 8; d++) {
              rule[a][b][c][d] = Array(9);
              for (e = 0; e <= 8; e++) {
                rule[a][b][c][d][e] = -1;
              }
            }
          }
        }
      }
      grid[0] = (function() {
        var _ref, _results;
        _results = [];
        for (a = 0, _ref = options.max; 0 <= _ref ? a < _ref : a > _ref; 0 <= _ref ? a++ : a--) {
          _results.push((function() {
            var _ref2, _results2;
            _results2 = [];
            for (b = 0, _ref2 = options.max; 0 <= _ref2 ? b < _ref2 : b > _ref2; 0 <= _ref2 ? b++ : b--) {
              _results2.push(0);
            }
            return _results2;
          })());
        }
        return _results;
      })();
      grid[1] = (function() {
        var _ref, _results;
        _results = [];
        for (a = 0, _ref = options.max; 0 <= _ref ? a < _ref : a > _ref; 0 <= _ref ? a++ : a--) {
          _results.push((function() {
            var _ref2, _results2;
            _results2 = [];
            for (b = 0, _ref2 = options.max; 0 <= _ref2 ? b < _ref2 : b > _ref2; 0 <= _ref2 ? b++ : b--) {
              _results2.push(0);
            }
            return _results2;
          })());
        }
        return _results;
      })();
      readLoopAndRules(seedLoop, rules);
      return clearUndefinedRules();
    };
    startAction = function(event, arg) {
      $("#pause-button").text("Stop");
      running = true;
      return mainLoop = window.setInterval(run, options.delay);
    };
    stopAction = function(event, arg) {
      $("#pause-button").text("Start");
      running = false;
      return window.clearInterval(mainLoop);
    };
    $('#reset-button').click(function() {
      stopAction();
      reinit();
      return paint();
    });
    $('#pause-button').click(function() {
      if ($(this).text() === "Stop") {
        return stopAction();
      } else if ($(this).text() === "Start") {
        return startAction();
      }
    });
    run = function() {
      if (running || stepsLeft > 0) {
        setNextGeneration();
        if ((steps % options.refreshSteps === 0) || (stepsLeft > 0)) paint();
        if (stepsLeft > 0) stepsLeft--;
        steps++;
        return $('#counter').text(steps);
      }
    };
    reinit();
    $("canvas").attr("width", width).attr("height", height);
    paint();
    return $("#pause-button").removeAttr("disabled");
  });

}).call(this);
