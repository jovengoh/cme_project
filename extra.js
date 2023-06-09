
async function _data(d3,FileAttachment){return(
    d3.csvParse(await FileAttachment("category-brands.csv").text(), d3.autoType)
    )}
    
    function _replay(html){return(
    html`<button>Replay`
    )}
    
    
    async function* _chart(replay,d3,width,height,bars,axis,
        labels,ticker,keyframes,duration,x,invalidation)
    {
      replay;
    
      const svg = d3.create("svg")
          .attr("viewBox", [0, -40, width, height + 100]);
    
      const updateBars = bars(svg);
      const updateAxis = axis(svg);
      const updateLabels = labels(svg);
      const updateTicker = ticker(svg);
    
      yield svg.node();
    
      for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
    
        // Extract the top bar’s value.
        x.domain([0, keyframe[1][0].value]);
    
        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);
    
        invalidation.then(() => svg.interrupt());
        await transition.end();
      }
    }
    
    
    function _duration(){return(
    250
    )}
    

 
    function _n(){return(
    14
    )}
    

    function _names(data){return(
    new Set(data.map(d => d.name))
    )}
    

    function _datevalues(d3,data){return(
    Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
      .map(([date, data]) => [new Date(date), data])
      .sort(([a], [b]) => d3.ascending(a, b))
    )}

    function _k(){return(
    10
    )}

    function _rank(names,d3,n){return(
        function rank(value) {
          const data = Array.from(names, name => ({name, value: value(name)}));
          data.sort((a, b) => d3.descending(a.value, b.value));
          for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
          return data;
        }
        )}
    
    function _keyframes(d3,datevalues,k,rank)
    {
      const keyframes = [];
      let ka, a, kb, b;
      for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
          const t = i / k;
          keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
          ]);
        }
      }
      keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
      return keyframes;
    }
    

    function _nameframes(d3,keyframes){return(
    d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    )}
    
    function _prev(nameframes,d3){return(
    new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
    )}
    
    function _next(nameframes,d3){return(
    new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
    )}
    
    
    function _bars(n,color,y,x,prev,next){return(
    function bars(svg) {
      let bar = svg.append("g")
          .attr("fill-opacity", 0.6)
        .selectAll("rect");
    
      return ([date, data], transition) => bar = bar
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("rect")
            .attr("fill", color)
            .attr("height", y.bandwidth())
            .attr("x", x(0))
            .attr("y", d => y((prev.get(d) || d).rank))
            .attr("width", d => x((prev.get(d) || d).value) - x(0)),
          update => update,
          exit => exit.transition(transition).remove()
            .attr("y", d => y((next.get(d) || d).rank))
            .attr("width", d => x((next.get(d) || d).value) - x(0))
        )
        .call(bar => bar.transition(transition)
          .attr("y", d => y(d.rank))
          .attr("width", d => x(d.value) - x(0)));
    }
    )}
    

    function _labels(n,x,prev,y,next,textTween){return(
    function labels(svg) {
      let label = svg.append("g")
          .style("font", "bold 12px var(--sans-serif)")
          .style("font-variant-numeric", "tabular-nums")
          .attr("text-anchor", "end")
        .selectAll("text");
    
      return ([date, data], transition) => label = label
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("text")
            .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
            .attr("y", y.bandwidth() / 2)
            .attr("x", -6)
            .attr("dy", "-0.25em")
            .text(d => d.name)
            .call(text => text.append("tspan")
              .attr("fill-opacity", 0.7)
              .attr("font-weight", "normal")
              .attr("x", -6)
              .attr("dy", "1.15em")),
          update => update,
          exit => exit.transition(transition).remove()
            .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
        )
        .call(bar => bar.transition(transition)
          .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
          .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))))
    }
    )}
    
   

  
    
    function _formatNumber(d3){return(
    d3.format(",d")
    )}
    
    
    function _axis(margin,d3,x,width,barSize,n,y){return(
    function axis(svg) {
      const g = svg.append("g")
          .attr("transform", `translate(0,${margin.top})`);
    
      const axis = d3.axisTop(x)
          .ticks(width / 160)
          .tickSizeOuter(0)
          .tickSizeInner(-barSize * (n + y.padding()));
    
      return (_, transition) => {
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();
      };
    }
    )}
    
    function _ticker(barSize, width,margin,n,formatDate,keyframes){return(
    function ticker(svg) {
      const now = svg.append("text")
          .style("font", `var(--sans-serif)`)
          .style("font-size", `50px`)
          .style("font-variant-numeric", "tabular-nums")
          .style("font-weight", "bold")
          
          .attr("text-anchor", "end")
          .attr("x", width - 6 )
          .attr("y", margin.bottom -20)
          .attr("dy", "0.32em")
          .text(formatDate(keyframes[0][0]));
    
      return ([date], transition) => {
        transition.end().then(() => now.text(formatDate(date)));
      };
    }
    )}
    

    function _formatDate(d3){return(
    d3.utcFormat("%Y")
    )}
    

    function _color(d3,data)
    {
      const scale = d3.scaleOrdinal(d3.schemeTableau10);
      if (data.some(d => d.category !== undefined)) {
        const categoryByName = new Map(data.map(d => [d.name, d.category]))
        scale.domain(Array.from(categoryByName.values()));
        return d => scale(categoryByName.get(d.name));
      }
      return d => scale(d.name);
    }
    
    function _textTween(d3,formatNumber){return(
        function textTween(a, b) {
          const i = d3.interpolateNumber(a, b);
          return function(t) {
            this.textContent = formatNumber(i(t));
          };
        }
        )}

    
    function _x(d3,margin,width){return(
    d3.scaleLinear([0, 1], [margin.left, width - margin.right])
    )}
    

    function _y(d3,n,margin,barSize){return(
    d3.scaleBand()
        .domain(d3.range(n + 1))
        .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
        .padding(0.1)
    )}
    

    function _height(margin,barSize,n){return(
    margin.top + barSize * n + margin.bottom
    )}
    
    function _barSize(){return(
    48
    )}
    
    function _margin(){return(
    {top: 16, right: 6, bottom: 6, left: 0}
    )}
    
 
    function _d3(require){return(
    require("d3@6")
    )}
    
    // function _Scrubber(values, html, Inputs,{
    //   format = value => value,
    //   initial = 0,
    //   delay = null,
    //   autoplay = true,
    //   loop = true,
    //   loopDelay = null,
    //   alternate = false
    // } = {}) {
    //   values = Array.from(values);
      
    //   const form = html`<form style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;">
    //   <button name=b type=button style="margin-right: 0.4em; width: 5em;"></button>
    //   <label style="display: flex; align-items: center;">
    //     <input name=i type=range min=0 max=${values.length - 1} value=${initial} step=1 style="width: 180px;">
    //     <output name=o style="margin-left: 0.4em;"></output>
    //   </label>
    // </form>`;
    //   let frame = null;
    //   let timer = null;
    //   let interval = null;
    //   let direction = 1;
    //   function start() {
    //     form.b.textContent = "Pause";
    //     if (delay === null) frame = requestAnimationFrame(tick);
    //     else interval = setInterval(tick, delay);
    //   }
    //   function stop() {
    //     form.b.textContent = "Play";
    //     if (frame !== null) cancelAnimationFrame(frame), frame = null;
    //     if (timer !== null) clearTimeout(timer), timer = null;
    //     if (interval !== null) clearInterval(interval), interval = null;
    //   }
    //   function running() {
    //     return frame !== null || timer !== null || interval !== null;
    //   }
    //   function tick() {
    //     if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
    //       if (!loop) return stop();
    //       if (alternate) direction = -direction;
    //       if (loopDelay !== null) {
    //         if (frame !== null) cancelAnimationFrame(frame), frame = null;
    //         if (interval !== null) clearInterval(interval), interval = null;
    //         timer = setTimeout(() => (step(), start()), loopDelay);
    //         return;
    //       }
    //     }
    //     if (delay === null) frame = requestAnimationFrame(tick);
    //     step();
    //   }
    //   function step() {
    //     form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
    //     form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
    //   }
    //   form.i.oninput = event => {
    //     if (event && event.isTrusted && running()) stop();
    //     form.value = values[form.i.valueAsNumber];
    //     form.o.value = format(form.value, form.i.valueAsNumber, values);
    //   };
    //   form.b.onclick = () => {
    //     if (running()) return stop();
    //     direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
    //     form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
    //     form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
    //     start();
    //   };
    //   form.i.oninput();
    //   if (autoplay) start();
    //   else stop();
    //   Inputs.disposal(form).then(stop);
    //   return form;
    // }

    export default function define(runtime, observer) {
      const main = runtime.module();
      function toString() { return this.url; }
      const fileAttachments = new Map([
        ["category-brands.csv", {url: new URL("./RACING_ILO.csv", import.meta.url), mimeType: "text/csv", toString}]
      ]);
      main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
      main.variable().define("data", ["d3","FileAttachment"], _data);
      main.variable(observer("viewof replay")).define("viewof replay", ["html"], _replay);
      main.variable().define("replay", ["Generators", "viewof replay"], (G, _) => G.input(_));
   
      // main.variable(observer("viewof scrubber")).define("viewof scrubber", ["datevalues","html","Inputs"], _Scrubber);
      // main.variable().define("scrubber", ["Generators", "viewof scrubber"], (G, _) => G.input(_));

      main.variable(observer("chart")).define("chart", ["replay","d3","width","height","bars","axis","labels","ticker","keyframes","duration","x","invalidation"], _chart);
      main.variable().define("duration", _duration);
      main.variable().define("n", _n);
      main.variable().define("textTween", ["d3","formatNumber"], _textTween);
      main.variable().define("names", ["data"], _names);
      main.variable().define("rank", ["names","d3","n"], _rank);

      main.variable().define("datevalues", ["d3","data"], _datevalues);

      main.variable().define("k", _k);
      main.variable().define("keyframes", ["d3","datevalues","k","rank"], _keyframes);
      main.variable().define("nameframes", ["d3","keyframes"], _nameframes);
      main.variable().define("prev", ["nameframes","d3"], _prev);
      main.variable().define("next", ["nameframes","d3"], _next);
      main.variable().define("bars", ["n","color","y","x","prev","next"], _bars);
      main.variable().define("labels", ["n","x","prev","y","next","textTween"], _labels);


      main.variable().define("formatNumber", ["d3"], _formatNumber);

      main.variable().define("axis", ["margin","d3","x","width","barSize","n","y"], _axis);

      main.variable().define("ticker", ["barSize","width","margin","n","formatDate","keyframes"], _ticker);

      main.variable().define("formatDate", ["d3"], _formatDate);

      main.variable().define("color", ["d3","data"], _color);

      main.variable().define("x", ["d3","margin","width"], _x);

      main.variable().define("y", ["d3","n","margin","barSize"], _y);

      main.variable().define("height", ["margin","barSize","n"], _height);
      main.variable().define("barSize", _barSize);
      main.variable().define("margin", _margin);

      main.variable().define("d3", ["require"], _d3);

      return main;
    }
    
