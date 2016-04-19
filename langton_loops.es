$(() => { // TODO de-jquerify
  let setInterval = window.setInterval;
  let simulation = {
    started: true,
    running: false,
    width: 600,
    height: 600,
    mainLoop: 0,
    rule: Array(9),
    options: {
      gridSize: 100,
      fringe: 0,
      delay: 1,
      seedPosition: [45,45],
      refreshSteps: 1
    },

    grid: Array(2),
    cd: 0,
    steps: 0,
    states: 8,
    enumStates: [0,1,2,3,4,5,6,7,8],
    stepsLeft: 0,
    loopColors:
      ['black', '#1f77b4', '#d62728', '#2ca02c', '#bcbd22', '#e377c2', '#e377c2', '#17becf', '#ff7f0e'],
    seed: [
      ' 22222222',
      '2170140142',
      '2022222202',
      '272    212',
      '212    212',
      '202    212',
      '272    212',
      '21222222122222',
      '207107107111112',
      ' 2222222222222'].map((row)=>row.split('').map((char)=>(!isNaN(parseInt(char)))?parseInt(char):0))
  };

  let canvas = $('#gr'); // TODO de-jquerify
  let gr = canvas[0].getContext('2d'); // TODO de-jquerify

  // https://github.com/GollyGang/ruletablerepository/blob/gh-pages/downloads/Langtons-Loops.table
  // 8 states
  // 219 rules
  // format: C N E S W C'

  simulation.rules =
    `000000 000012 000020 000030 000050 000063 000071 000112 000122 000132 000212
     000220 000230 000262 000272 000320 000525 000622 000722 001022 001120 002020
     002030 002050 002125 002220 002322 005222 012321 012421 012525 012621 012721
     012751 014221 014321 014421 014721 016251 017221 017255 017521 017621 017721
     025271 100011 100061 100077 100111 100121 100211 100244 100277 100511 101011
     101111 101244 101277 102026 102121 102211 102244 102263 102277 102327 102424
     102626 102644 102677 102710 102727 105427 111121 111221 111244 111251 111261
     111277 111522 112121 112221 112244 112251 112277 112321 112424 112621 112727
     113221 122244 122277 122434 122547 123244 123277 124255 124267 125275 200012
     200022 200042 200071 200122 200152 200212 200222 200232 200242 200250 200262
     200272 200326 200423 200517 200522 200575 200722 201022 201122 201222 201422
     201722 202022 202032 202052 202073 202122 202152 202212 202222 202272 202321
     202422 202452 202520 202552 202622 202722 203122 203216 203226 203422 204222
     205122 205212 205222 205521 205725 206222 206722 207122 207222 207422 207722
     211222 211261 212222 212242 212262 212272 214222 215222 216222 217222 222272
     222442 222462 222762 222772 300013 300022 300041 300076 300123 300421 300622
     301021 301220 302511 401120 401220 401250 402120 402221 402326 402520 403221
     500022 500215 500225 500232 500272 500520 502022 502122 502152 502220 502244
     502722 512122 512220 512422 512722 600011 600021 602120 612125 612131 612225
     700077 701120 701220 701250 702120 702221 702251 702321 702525 702720 `.trim().split(/\s+/);
  //

  let reInit = function(sim) {
    let options = sim.options;
    let a, b, c, d, e, k, m, n, o, p;
    sim.steps = 0;
    $('#counter').text('0'); // TODO de-jquerify
    sim.stepsLeft = 0;
    sim.cd = 0;
    sim.running = false;
    sim.started = true;
    for (a = k = 0; k <= 8; a = ++k) {
      sim.rule[a] = Array(9);
      for (b = m = 0; m <= 8; b = ++m) {
        sim.rule[a][b] = Array(9);
        for (c = n = 0; n <= 8; c = ++n) {
          sim.rule[a][b][c] = Array(9);
          for (d = o = 0; o <= 8; d = ++o) {
            sim.rule[a][b][c][d] = Array(9);
            for (e = p = 0; p <= 8; e = ++p) {
              sim.rule[a][b][c][d][e] = -1;
            }
          }
        }
      }
    }
    sim.grid[0] = (function() {
      let q, ref, results;
      results = [];
      for (a = q = 0, ref = options.gridSize; 0 <= ref ? q < ref : q > ref; a = 0 <= ref ? ++q : --q) {
        results.push((function() {
          let ref1, results1, u;
          results1 = [];
          for (b = u = 0, ref1 = options.gridSize; 0 <= ref1 ? u < ref1 : u > ref1; b = 0 <= ref1 ? ++u : --u) {
            results1.push(0);
          }
          return results1;
        })());
      }
      return results;
    })();
    sim.grid[1] = (function() {
      let q, ref, results;
      results = [];
      for (a = q = 0, ref = options.gridSize; 0 <= ref ? q < ref : q > ref; a = 0 <= ref ? ++q : --q) {
        results.push((function() {
          let ref1, results1, u;
          results1 = [];
          for (b = u = 0, ref1 = options.gridSize; 0 <= ref1 ? u < ref1 : u > ref1; b = 0 <= ref1 ? ++u : --u) {
            results1.push(0);
          }
          return results1;
        })());
      }
      return results;
    })();
    placeSeed(sim);
    initRules(sim);
    clearUndefinedRules(sim);
  };

  placeSeed = function(sim) {
    let rules = sim.rules;
    let seed = sim.seed;
    let gridSize = sim.options.gridSize;
    let startPos = (gridSize / 2) - 5;
    let seedLoc = {
      y: startPos
    };
    let seedRowLength;
    seed.forEach((row) => {
      seedLoc.y++;
      seedLoc.x = startPos;
      seedWidth = row.length;
      for (var j = 0; j < seedWidth; j++) {
        seedLoc.x++;
        let value = row[j];
        sim.grid[sim.cd][seedLoc.x][seedLoc.y] = value;
      }

    });
  };


  initRules = function(sim) {
    let rules = sim.rules;
    let c, t, r, b, l, i;
    for (n = 0; n < rules.length; n++) {
      [c, t, r, b, l, i] = rules[n].split('');
      sim.rule[c][t][r][b][l] = i;//       T
      sim.rule[c][l][t][r][b] = i;//     L C R   >>=>> I (next state)
      sim.rule[c][b][l][t][r] = i;//       B
      sim.rule[c][r][b][l][t] = i;//   (with rotations)
    }
  };

  // TODO simplify/rename clearUndefinedRules
  // let forDim = function(rules, states, d) {
  //   enumStates.forEach((a) => {
  //     return forDim(rules, states, d+1);
  //   });
  // };

  let clearUndefinedRules = function(sim) {//rules, states) {
    // [0,1,2,3,4].forEach((d) => forDim(rules, states, d));

    let states = sim.states;
    let a, b, c, d, e;
    //let states = 8;
    for (a = k = 0; k <= states; a = ++k) {
      for (b = m = 0; m <= states; b = ++m) {
        for (c = n = 0; n <= states; c = ++n) {
          for (d = o = 0; o <= states; d = ++o) {
            for (e = p = 0; p <= states; e = ++p) {
              if (sim.rule[a][b][c][d][e] === -1) {
                sim.rule[a][b][c][d][e] = a;
              }
            }
          }
        }
      }
    }
  };

  let setNextGeneration = function(sim) {
    let options = sim.options;
    let X, Y, c, k, m, ref, ref1;
    c = sim.grid[sim.cd];
    for (X = k = 1, ref = options.gridSize - 1; 1 <= ref ? k < ref : k > ref; X = 1 <= ref ? ++k : --k) {
      for (Y = m = 1, ref1 = options.gridSize - 1; 1 <= ref1 ? m < ref1 : m > ref1; Y = 1 <= ref1 ? ++m : --m) {
        sim.grid[1 - sim.cd][X][Y] = sim.rule[c[X][Y]][c[X][Y - 1]][c[X + 1][Y]][c[X][Y + 1]][c[X - 1][Y]];
      }
    }
    return sim.cd = 1 - sim.cd;
  };

  let clear = function(context) {
    return function() {
      context.fillStyle = '#fff';
      return context.fillRect(0, 0, context.width, context.height);
    }
  }(gr);

  let plot = function(context) {
    return function(x, y, w, h, color) {
      context.fillStyle = color;
      return context.fillRect(x, y, w, h);
    }
  }(gr);

  let paint = function(graphicsContext) {
    return function(sim) {
      let options = sim.options;
      let X, Y, b, color, fr, k, ref, results, sq;
      if (sim.started) {
        clear(graphicsContext);
        sim.started = false;
      }
      sq = sim.width / options.gridSize;
      fr = options.fringe;
      b = sq + fr;
      results = [];
      for (X = k = 0, ref = options.gridSize; 0 <= ref ? k < ref : k > ref; X = 0 <= ref ? ++k : --k) {
        results.push((function() {
          let m, ref1, results1;
          results1 = [];
          for (Y = m = 0, ref1 = options.gridSize; 0 <= ref1 ? m < ref1 : m > ref1; Y = 0 <= ref1 ? ++m : --m) {
            color = sim.grid[sim.cd][X][Y];
            results1.push(plot(X * b, Y * b, sq, sq, sim.loopColors[color]));
          }
          return results1;
        })());
      }
      return results;
    };
  }(gr);

  let pausebutton = $('#pause-button'); // TODO de-jquerify

  startAction = (event, arg) => {
    $('#pause-button').text('Stop'); // TODO de-jquerify
    simulation.running = true;
    runSim = () => run(simulation);
    simulation.mainLoop = setInterval(runSim, simulation.options.delay);
  };

  stopAction = (event, arg) => {
    $('#pause-button').text('Start');
    simulation.running = false;
    window.clearInterval(simulation.mainLoop);
  };

  let onReset = (sim) => {
    stopAction(sim);
    reInit(sim);
    paint(sim);
  };

  $('#reset-button').click(() => onReset(simulation));// TODO de-jquerify

  $('#pause-button').click(() => {
    let text = $('#pause-button').text();
    if (text === 'Stop') {
      stopAction();
    } else if (text === 'Start') {
      startAction();
    }
    return false;
  });// TODO de-jquerify

  run = (sim) => {
    if (sim.running || sim.stepsLeft > 0) {
      setNextGeneration(sim);
      if ((sim.steps % sim.options.refreshSteps === 0) || (sim.stepsLeft > 0)) {
        paint(sim);
      }
      if (sim.stepsLeft > 0) {
        sim.stepsLeft--;
      }
      sim.steps++;
      $('#counter').text(sim.steps); // TODO de-jquerify
    }
  };

  reInit(simulation);
  $('canvas').attr("width", simulation.width).attr("height", simulation.height); // TODO de-jquerify
  paint(simulation);
  $("#pause-button").removeAttr("disabled"); // TODO de-jquerify
});
