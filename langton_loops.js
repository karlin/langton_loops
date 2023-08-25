;(function () {
  // From necsi.edu/postdocs/sayama/sdsr/java/loops.java
  // Self-Replicating Loops & Ant, Programmed by Eli Bachmutsky, Copyleft Feb.1999
  var simulation = {
    running: false,
    width: 600,
    height: 600,
    rule: Array(9),
    options: {
      gridSize: 100,
      fringe: 0,
      seedPosition: [45, 45],
      refreshSteps: 1,
    },
    grid: Array(2),
    cd: 0,
    steps: 0,
    states: 8,
    loopColors: [
      "black",
      "#1f77b4",
      "#d62728",
      "#2ca02c",
      "#bcbd22",
      "#e377c2",
      "#e377c2",
      "#17becf",
      "#ff7f0e",
    ],
    seed: [
      " 22222222",
      "2170140142",
      "2022222202",
      "272    212",
      "212    212",
      "202    212",
      "272    212",
      "21222222122222",
      "207107107111112",
      " 2222222222222",
    ].map((row) =>
      row.split("").map((char) => (!isNaN(parseInt(char)) ? parseInt(char) : 0))
    ),
    // https://github.com/GollyGang/ruletablerepository/blob/gh-pages/downloads/Langtons-Loops.table
    // 8 states
    // 219 rules
    // format: C N E S W C'
    rules:
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
     700077 701120 701220 701250 702120 702221 702251 702321 702525 702720`.split(
        /\s+/
      ),
    ui: {
      counter: 0,
      counterChanged() {
        document.getElementById("counter").textContent = this.counter
      },
      resetCounter() {
        this.counter = 0
        this.counterChanged()
      },
      pauseButton: () => document.getElementById("pause-button"),
      resetButton: () => document.getElementById("reset-button"),
    },
  }

  let canvas = document.getElementById("gr")
  let frameReq

  let clearGrid = function (size) {
    plane = []
    for (var row = 0; row < size; row++) {
      plane.push(Array(size).fill(0))
    }
    return plane
  }

  let reInit = function (sim) {
    let a, b, c, d
    sim.steps = 0
    sim.ui.resetCounter()
    sim.cd = 0
    sim.running = false
    for (a = 0; a <= 8; a++) {
      sim.rule[a] = Array(9)
      for (b = 0; b <= 8; b++) {
        sim.rule[a][b] = Array(9)
        for (c = 0; c <= 8; c++) {
          sim.rule[a][b][c] = Array(9)
          for (d = 0; d <= 8; d++) {
            sim.rule[a][b][c][d] = Array(9).fill(-1)
          }
        }
      }
    }
    sim.grid[0] = clearGrid(sim.options.gridSize)
    sim.grid[1] = clearGrid(sim.options.gridSize)
    placeSeed(sim)
    initRules(sim)
    clearUndefinedRules(sim)
  }

  const placeSeed = function (sim) {
    let seed = sim.seed
    let gridSize = sim.options.gridSize
    let startPos = Math.floor(gridSize / 2 - 5)
    let seedLoc = {
      y: startPos,
    }
    seed.forEach((row) => {
      seedLoc.y++
      seedLoc.x = startPos
      seedWidth = row.length
      for (var j = 0; j < seedWidth; j++) {
        seedLoc.x++
        sim.grid[sim.cd][seedLoc.x][seedLoc.y] = row[j]
      }
    })
  }

  const initRules = function (sim) {
    let rules = sim.rules
    let c, t, r, b, l, i
    for (let n = 0; n < rules.length; n++) {
      ;[c, t, r, b, l, i] = rules[n].split("")
      sim.rule[c][t][r][b][l] = i //       T
      sim.rule[c][l][t][r][b] = i //     L C R   >>=>> I (next state)
      sim.rule[c][b][l][t][r] = i //       B
      sim.rule[c][r][b][l][t] = i //   (with rotations)
    }
  }

  const clearUndefinedRules = function (sim) {
    let states = sim.states
    let a, b, c, d, e
    for (a = 0; a <= states; a++) {
      for (b = 0; b <= states; b++) {
        for (c = 0; c <= states; c++) {
          for (d = 0; d <= states; d++) {
            for (e = 0; e <= states; e++) {
              if (sim.rule[a][b][c][d][e] === -1) {
                sim.rule[a][b][c][d][e] = a
              }
            }
          }
        }
      }
    }
  }

  const setNextGeneration = function (sim) {
    const options = sim.options
    let X, Y, c
    c = sim.grid[sim.cd]
    for (X = 1; X < options.gridSize - 1; X++) {
      for (Y = 1; Y < options.gridSize - 1; Y++) {
        sim.grid[1 - sim.cd][X][Y] =
          sim.rule[c[X][Y]][c[X][Y - 1]][c[X + 1][Y]][c[X][Y + 1]][c[X - 1][Y]]
      }
    }
    sim.cd = 1 - sim.cd
  }

  const paint = (function (graphicsContext) {
    return function (sim) {
      let options = sim.options
      let X, Y, b, fr, sq, gridCol
      sq = sim.width / options.gridSize
      fr = options.fringe
      b = sq + fr
      for (X = 0; X < options.gridSize; X++) {
        gridCol = sim.grid[sim.cd][X]
        for (Y = 0; Y < options.gridSize; Y++) {
          graphicsContext.fillStyle = sim.loopColors[gridCol[Y]]
          graphicsContext.fillRect(X * b, Y * b, sq, sq)
        }
      }
    }
  })(canvas.getContext("2d"))

  let animateSimulation = (sim) => {
    function animate() {
      frameReq = window.requestAnimationFrame(animate)
      run(sim)
    }
    animate()
  }

  let start = (sim) => {
    sim.ui.pauseButton().textContent = "Pause"
    sim.running = true
    animateSimulation(sim)
  }

  let stop = (sim) => {
    sim.ui.pauseButton().textContent = "Start"
    sim.running = false
    window.cancelAnimationFrame(frameReq)
  }

  let run = (sim) => {
    if (sim.running) {
      setNextGeneration(sim)
      if (sim.steps % sim.options.refreshSteps === 0) {
        paint(sim)
      }
      sim.steps++
      sim.ui.counter = sim.steps
      sim.ui.counterChanged()
    }
  }

  let onReset = (sim) => {
    stop(sim)
    reInit(sim)
    paint(sim)
  }

  let onPause = (sim) => {
    if (sim.running) {
      stop(sim)
    } else {
      start(sim)
    }
  }

  canvas.setAttribute("width", simulation.width)
  canvas.setAttribute("height", simulation.height)

  simulation.ui.resetButton().onclick = function () {
    onReset(simulation)
  }
  simulation.ui.pauseButton().onclick = function () {
    onPause(simulation)
  }
  onReset(simulation)
  simulation.ui.pauseButton().removeAttribute("disabled")

}).call(this)
