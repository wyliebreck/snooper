<!doctype html> 
<html>
  <head>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Snooper</title>
    <script defer src="https://pages.itsy.tech/c676d2db12?papaparse"></script>
    <script defer src="https://pages.itsy.tech/f4dd5a086c?table"></script>
    <script defer src="https://pages.itsy.tech/bd646e7309?array"></script>
    <script defer src="https://pages.itsy.tech/9cd2defe01?ufuncs"></script>
    <script defer src="https://code.highcharts.com/highcharts.js"></script>
    <script defer src="https://code.highcharts.com/highcharts-more.js"></script>
    <script defer src="https://code.highcharts.com/modules/heatmap.js"></script>
    <script defer src="https://code.highcharts.com/modules/exporting.js"></script>
    <style>
			@import url("https://fonts.googleapis.com/css2?family=Roboto");
      :root {--left-width: 400px}
      * {margin: 0; padding: 0; position: relative}
      a {color: blue; text-decoration: none; cursor: pointer}
      a.on {background-color: white;}
      a.inactive {color: lightblue; text-decoration: line-through;}
      body {font-family: "Roboto", sans-serif; font-size: 14px}
      button {cursor: pointer; background-color: rgb(220,220,220); color: black; border: none; padding: 4px; border-radius: 4px}
      button + button {margin-left: 0.5em}
      hr {margin: 5px 0}
      ol {margin: 1em 2em;}
      p {margin: 1em;}
      table {border-collapse: collapse; min-width: 100%;}
      th {background-color: rgb(255,220,0)}
      th, td {border: thin lightgray solid; padding: 0.2em; text-align: center; vertical-align: middle;}
      .hidden {display: none;}
      #leftDiv {position: fixed; top: 0; bottom: 0; left: 0; width: var(--left-width); box-sizing: border-box; overflow-y: auto; background-color: rgb(240,240,240); padding: 15px}
      #filename {font-size: 25px; font-weight: 600; margin-bottom: 5px}
      #leftDiv a {display: block; overflow-x: hidden; white-space: nowrap;}
      #instructions {position: fixed; top: 0; bottom: 0; left: var(--left-width); right: 0; padding: 2em; text-align: left; z-index: 10; background-color: white;}
      #rightDiv {position: fixed; top: 0; bottom: 0; left: var(--left-width); right: 0; text-align: center; background-color: rgb(200, 200, 200); box-sizing: border-box; overflow-x: auto; overflow-y: auto}
      #rightDiv div {background-color: white}
    </style>
  </head>
  <body>
		<div id="leftDiv">
      <div id="topDiv">
        <div id="filename">No course selected</div>
        <div id="buttons">
          <button id="open" onclick="selectCourse();">Select...</button>
          <button id="close" onclick="home();" class="hidden">Close</button>
        </div>
      </div>
      <div id="actions" class="hidden">
        <hr>
        <a onclick="prep(); summary()">Summary of data</a>
        <hr>
        <a id="start" onclick="prep(); dailyEnrolments();">Daily enrolments</a>
        <hr>
        <a onclick="prep(); activityMarksScatter();">Student mark vs total activity - scatter</a>
        <a onclick="prep(); activityMarksList();">Student mark vs total activity - list</a>
        <hr>
        <a onclick="prep(); eventsByWeek(events, 'events', '50%'); eventsByLinearDay(events, 'events', '50%');">All activity by week and by day</a>
        <a onclick="prep(); eventsByHour(events, 'events', '100%');">All activity by day and hour</a>
        <hr>
        <!--<a onclick="prep(); listEvents('week', 'page');">Page activity total</a>-->
        <a onclick="prep(); listEvents('week', 'page');">Page activity each week</a>
        <a onclick="prep(); pageDurations();">Page view time - medians</a>
        <a onclick="prep(); pageDurations('boxplot');">Page view time - box plot</a>
        <hr>
        <!--<a onclick="prep(); listEvents('week', 'user');">Student activity total</a>-->
        <a onclick="prep(); listEvents('week', 'user');">Student activity each week</a>
        <a onclick="prep(); listEvents('day', 'user');">Student activity each day</a>
        <a onclick="prep(); listEvents('hour', 'user');">Student activity each hour</a>
        <hr>
        <a onclick="prep(); fillPages();" class="items">A particular page...</a>
        <a onclick="prep(); fillStudents();" class="items">A particular student...</a>
        <hr>
      </div>
      <div id="actionItems" class="hidden"></div>
    </div>
    <div id="instructions">
      <p>Hi,</p>
      <p>This is a tool to help view the Moodle logs for a course.</p>
      <p>You need to have the logs in a folder on your computer:</p>
      <ol>
        <li>Go to the course home page in Moodle.</li>
        <li>Click the cog.</li>
        <li>Click "More...".</li>
        <li>Click "Reports".</li>
        <li>Click "Logs".</li>
        <li>Click "Get these logs".</li>
        <li>Put the downloaded file in your folder.</li>
      </ol>
      <p>You also need a list of students:</p>
      <ol>
        <li>Go to the course "Grades" page in Moodle.</li>
        <li>Click "Export".</li>
        <li>Click "Plain text file".</li>
        <li>Click "Export format options".</li>
        <li>Uncheck "Exclude inactive users".</li>
        <li>Click "Download".</li>
        <li>Put the downloaded file in your folder.</li>
      </ol>
      <p>Once you have these two files in your folder, click the "Select" button on this page and select the folder.</p>
    </div>
		<div id="rightDiv"></div>
    <div id="dummy" class="hidden"></div>
	</body>
</html>
<script>
  // Setup
  let dirHandle, events, students, patientEvents;
  window.addEventListener("load", function(){
    Table.printTarget = document.getElementById("rightDiv")
  });
  function prep() {
    selectAction(event.target);
    document.querySelector("#rightDiv").innerHTML = "";
  }
  function home() {
    document.querySelector("#filename").innerHTML = "No course selected";
    document.getElementById("close").classList.add("hidden");
    document.getElementById("actions").classList.add("hidden");
    document.getElementById("actionItems").classList.add("hidden");
    document.getElementById("instructions").classList.remove("hidden");
  }
  // Selecting options
  function selectAction(elt) {
    document.querySelectorAll("#actions a").forEach(x => x.classList.remove("on"));
    elt.classList.add("on");
    if (elt.classList.contains("items")) document.getElementById("actionItems").classList.remove("hidden");
    else document.getElementById("actionItems").classList.add("hidden");
  }
  function selectActionItem(elt) {
    document.querySelectorAll("#actionItems a").forEach(x => x.classList.remove("on"));
    elt.classList.add("on");
  }
  // Filling lists
  function fillPages() {
    document.getElementById("actionItems").innerHTML = "";
    let pages = events.column("page").uniques().filter(x => !x.startsWith("Course:")).sort();
    for (let page of pages) document.getElementById("actionItems").innerHTML += "<a onclick='prep(); showPage(this, `"+page+"`)' class='items'>"+page+"<a>";
    document.querySelectorAll("#actionItems a").forEach(x => x.innerHTML = x.innerText);
  }
  function fillStudents() {
    selectAction(event.target);
    document.getElementById("actionItems").innerHTML = "";
    for (let row of students.rows()) {
      let text= row.name + (row.grade ? ` (${row.grade})` : "");
      let cls = row.active ? "" : "inactive";
      document.getElementById("actionItems").innerHTML += `<a onclick='prep(); showStudent(this, "${row.name}")' class='items ${cls}'>${text}<a>`;
    }
  }
  // Showing the plots
  function showPage(elt, name) {
    let evts = events.copy().select(row => row.page === name);
    eventsByWeek(evts, "events", "50%"); eventsByLinearDay(evts, "events", "50%"); selectActionItem(elt);
  }
  function showStudent(elt, name) {
    let evts = events.copy().select(row => row.user === name);
    eventsByWeek(evts, "events", "27.5%"); eventsByLinearDay(evts, "events", "27.5%"); eventsByHour(evts, "events", "45%"); selectActionItem(elt);
  }
  // The plots
  function summary() {
    events.describe(); patientEvents.describe(); students.describe();
  }
  function dailyEnrolments() {
    let types = ["User enrolled in course", "User unenrolled from course", "User unenrolment updated"];
    let data = patientEvents.copy()
      .select(row => types.includes(row.type))
      .update({index: row => row.week*7 + row.day});
    let [startIndex, endIndex] = [data.column("index").min(), data.column("index").max()];
    let changes = data.group("index")
      .select(
        "index",
        {change: row => row.type.map(x => x === "User enrolled in course" ? 1 : -1).sum()},
      )
      .rows().map(row => ({index: row.index, change: row.change}));
    let current = 0; let counts = [];
    for (i = startIndex; i <= endIndex; i++) {
      current = current + (changes.find(x => x.index === i)?.change || 0);
      counts.push({x: i, y: current});
    }
    addChart({
      height: "100%",
      title: {text: "Daily enrolments"},
      subtitle: {text: "The period between the start of O-Week and the census date is shaded."},
      xAxis: {
        min: -35, max: 56,
        tickPositions: [1, 8, 15, 22, 29, 36, 43, 50, 57],
        labels: {formatter: function(){return "Week "+Math.floor(this.value/7)+"\u2192"}},
        gridLineWidth: 1,
        plotBands: [{from: 1, to: 12, color: Ufuncs.rgba("indigo", 0.1)}],
      },
      yAxis: {min: 0, title: false, tickInterval: 5},
      series: [{type: "line", data: counts, color: Ufuncs.rgba("indigo")}],
    });
  }
  function activityMarksScatter() {
    data = events.copy()
    .ijoin(students.copy().select({user: "name"}, {user_mark: "mark"}, {user_grade: "grade"}))
      .group("user")
      .select({x: row => row.time.length, y: row => row.user_mark[0], color: row => Ufuncs.markColor(row.y)});
    addChart({
      height: "100%",
      title: {text: "Student mark versus total activity"},
      subtitle: {text: "Each point is a student. The x-coordinate is her total activity. The y-coordinate is her final mark."},
      xAxis: {title: {text: "Total activity"}, min: 0, max: data.column("x").max(), endOnTick: true, gridLineWidth: 1},
      yAxis: {title: {text: "Final mark"}, tickPositions: [0,50,65,75,85,100]},
      series: [{type: "scatter", data: data.rows(), marker: {radius: 8}}],
    });
  }
  function activityMarksList() {
    data = events.copy()
      .ijoin(students.copy().select({user: "name"}, {user_mark: "mark"}, {user_grade: "grade"}))
      .group("user")
      .select({name: "user", y: row => row.time.length, mark: row => row.user_mark[0], grade: row => row.user_grade[0], color: row => Ufuncs.markColor(row.mark)})
      .sort("~mark","name")
    let student_names = data.column("name");
    data.insert({x: row => student_names.indexOf(row.name)});
    addChart({
      height: student_names.length*25 + "px",
      title: {text: "Student mark versus total activity"},
      subtitle: {text: "Students are sorted by their final mark, with the best mark at the top. The length of the bar represents her total activity."},
      xAxis: {categories: student_names},
      yAxis: {title: {text: "Total activity"}, min: 0, max: data.column("y").max(), endOnTick: true},
      series: [{type: "bar", data: data.rows(), dataLabels: {enabled: true, format: "{point.grade}"}}],
    });
  }
  function count(row, countWhat = "events") {
    if (countWhat === "events") return row.user.length;
    if (countWhat === "users") return row.user.uniques().length;
    return Math.round(row.user.length/row.user.uniques().length);
  }
  function eventsByWeek(evts, countWhat = "events", height = "50%") {
    data = evts.copy().group("week").select({x: "week", y: row => count(row, countWhat)});
    addChart({
      height: height,
      chart: {marginLeft: 50},
      title: {text: "Activity each week"},
      subtitle: {text: "Activity = the loading of a moodle page by a student"},
      xAxis: {min: 0, max: 7, labels: {formatter: function(){return Ufuncs.hexaweekName(this.value)}}},
      yAxis: {title: false, labels: {enabled: false}},
      series: [{type: "column", data: data.rows(), dataLabels: {enabled: true}, width: 30}],
    });    
  }
  function eventsByLinearDay(evts, countWhat = "events", height = "50%") {
    data = evts.copy()
      .group("week", "day")
      .select({x: row => row.week*7 + row.day, y: row => count(row, countWhat)});
    addChart({
      height: height,
      chart: {marginLeft: 50},
      title: {text: "Activity each day"},
      xAxis: {
        min: 1, max: 56,
        tickPositions: [0.5, 7.5, 14.5, 21.5, 28.5, 35.5, 42.5, 49.5, 56.5],
        labels: {formatter: function(){return "W"+Math.floor(this.value/7)+"\u2192"}},
        gridLineWidth: 1,
      },
      yAxis: {title: false},
      series: [{type: "column", data: data.rows(), width: 5}],
    });
  }
  function eventsByCalendarDay(evts, countWhat = "events", height = "50%") {
    data = evts.copy()
      .group("week", "day")
      .select({x: "week", y: "day", value: row => count(row, countWhat)})
    addChart({
      height: height,
      chart: {marginLeft: 50},
      title: {text: "Activity each day - calendar view"},
      xAxis: {type: "category", min: 0, max: 7, labels: {formatter: function(){return Ufuncs.hexaweekName(this.value)}}, tickmarkPlacement: "between"},
      yAxis: {type: "category", gridLineWidth: 1, labels: {formatter: function(){return Ufuncs.weekdayName(this.value)}}, reversed: true, title: false, tickmarkPlacement: "between"},
      series: [{type: "heatmap", data: data.rows(), dataLabels: {enabled: true}}],
      colorAxis: {minColor: "white", maxColor: Ufuncs.rgba("purple")},
    });
  }
  function eventsByHour(evts, countWhat = "events", height = "50%") {
    data = evts.copy()
      .group("hour", "day")
      .select({x: "day", y: "hour", value: row => count(row, countWhat)});
    addChart({
      height: height,
      chart: {marginLeft: 50},
      title: {text: "Activity each week hour"},
      xAxis: {type: "category", gridLineWidth: 1, labels: {formatter: function(){return Ufuncs.weekdayName(this.value)}}, title: false, tickmarkPlacement: "between"},
      yAxis: {
        type: "category", min: 0, max: 23, tickmarkPlacement: "between", gridLineWidth: 1, title: false,
        labels: {step: 1, formatter: function(){return String(this.value).padStart(2, 0)}},
      },
      series: [{type: "heatmap", data: data.rows(), dataLabels: {enabled: true}}],
      colorAxis: {minColor: "white", maxColor: Ufuncs.rgba("purple")},
    });    
  }
  function pageDurations(type = "bar") {
    if (events.cols.find(x => x.name === "mins") === undefined) calculateDurations();
    let pages = events.column("page").uniques().sort();
    data = events.copy()
      .select(row => row.mins >= 1 && row.mins <= 60)
      .group("page")
      .select({
        x: row => pages.indexOf(row.page),
        y: row => row.mins.median(),
        low: row => row.mins.min(),
        q1: row => row.mins.quantile(0.25),
        median: row => row.mins.median(),
        q3: row => row.mins.quantile(0.75),
        high: row => row.mins.max(),
      });
    let div = document.getElementById("dummy");
    pages = pages.map(x => {div.innerHTML = x; return div.innerText});
    addChart({
      height: pages.length*40 + "px",
      chart: {marginLeft: 400, inverted: type === "boxplot"},
      title: {text: `Each pages's median view time (in minutes)`},
      xAxis: {categories: pages, min: 0, max: pages.length-1, labels: {step: 1}, reversed: true, title: false, tickmarkPlacement: "between"},
      yAxis: {labels: {enabled: false}, title: false, min: 0, max: 60},
      series: [{
        type: type,
        data: data.rows(),
        dataLabels: {enabled: true, format: "{point.y} mins"},
        //whiskerLength: 0, stemWidth: 0,
      }],
      legend: false,
    });
  }
  function listEvents(xCol, yCol, height = "100%") {
    data = events.copy();
    if (yCol === "page") data.delete(row => row.page.startsWith("Course:"));
    let yVals = data.column(yCol).uniques().sort();
    data.group(xCol, yCol)
      .select({
        x: xCol,
        y: row => yVals.indexOf(row[yCol]),
        z: row => row.time.length,
        value: row => row.time.length,
      })
    let div = document.getElementById("dummy");
    yVals = yVals.map(x => {div.innerHTML = x; return div.innerText});
    addChart({
      height: yVals.length*25 + "px",
      chart: {marginLeft: yCol === "page" ? 400 : 200},
      title: {text: `Activity each ${xCol}`},
      xAxis: {
        type: "category", gridLineWidth: 1,
        labels: {formatter: function(){
          if (xCol === "week") return "Week "+this.value;
          if (xCol === "day") return Ufuncs.weekdayName(this.value);
          if (xCol === "hour") return String(this.value).padStart(2, 0);
        }},
        tickmarkPlacement: "between",
      },
      yAxis: {categories: yVals, min: 0, max: yVals.length-1, labels: {step: 1}, reversed: true, title: false, tickmarkPlacement: "between"},
      series: [{
        type: "heatmap",
        data: data.rows(),
        maxSize: 30,
        dataLabels: {enabled: true},
      }],
      colorAxis: {minColor: "white", maxColor: Ufuncs.rgba(xCol === "week" ? "teal" : xCol === "day" ? "pink" : "orange")},
      legend: false,
    });    
  }
  // Adding a chart
  function addChart(config = {}) {
		Highcharts.setOptions({
			chart: {style: {fontFamily: "Roboto"}, animation: false},
      colors: Object.values(Ufuncs.colors).slice(3).map(x => `rgb(${x[0]},${x[1]},${x[2]})`),
			credits: false,
			lang: {thousandsSep: ','},
      legend: false,
			plotOptions: {series: {animation: false, turboThreshold: 0}},
			xAxis: {tickmarkPlacement: "on"},
			yAxis: {stackLabels: {enabled: true}, tickmarkPlacement: "on"},
		});
    let div = document.createElement("div");
    div.style.width = config.width || "100%";
    div.style.height = config.height || "100%";
    document.getElementById("rightDiv").appendChild(div);
    Highcharts.chart(div, config);
  }
  // Selecting a course
  let code, hexa, day1;
	async function selectCourse() {
    let request = indexedDB.open("moodle-miner");
    request.onupgradeneeded = event => event.target.result.createObjectStore("options");
    request.onsuccess = () => {
      request.result.transaction("options").objectStore("options").get("dirHandle").onsuccess = async function(event){
        dirHandle = await window.showDirectoryPicker({startIn: event.target.result});
        indexedDB.open("moodle-miner").onsuccess = event => event.target.result.transaction("options", "readwrite").objectStore("options").put(dirHandle, "dirHandle");
        document.getElementById("filename").innerHTML = "Loading course...";
        document.getElementById("rightDiv").innerHTML = "";
        console.clear();
        await processLogFile();
        await processStudentFile();
        patientEvents = events.copy().select(row => students.column("name").includes(row.patient));
        events.select(row => students.column("name").includes(row.user) && row.week >= 0 && row.week <= 7);
        document.getElementById("filename").innerHTML = `${code} in ${hexa}`;
        document.getElementById("close").classList.remove("hidden");
        document.getElementById("actions").classList.remove("hidden");
        document.getElementById("instructions").classList.add("hidden");
        document.getElementById("start").click();
      };
    }
	}
  async function processLogFile() {
    for await (let [fileName, fileHandle] of dirHandle.entries()) if (fileName.startsWith("logs_")) {
      code = fileName.split("_")[1].split("-")[0];
      hexa = Ufuncs.termHexa(fileName.split("_")[1].split("-")[1]);
      day1 = Ufuncs.hexaStartDate(hexa);
      let file = await fileHandle.getFile();
      let text = await file.text();
      let data = Papa.parse(text.trim(), {header: true, dynamicTyping: true}).data;
      events = new Table(data);
      events.select({
        user: row => row["User full name"]?.slice(row["User full name"].indexOf(")") + 1).trim(),
        patient: row => row["Affected user"]?.slice(row["Affected user"].indexOf(")") + 1).trim(),
        date: function(row){
          if (row.Time) {
            let bits = row.Time.split(", ")[0].split("/");
            return `20${bits[2]}-${bits[1]}-${bits[0].padStart(2, 0)}`;
          } else return null;
        },
        time: row => row.Time ? row.Time.split(", ")[1] : null,
        week: row => Math.floor((Date.parse(row.date) - Date.parse(day1))/(1000*3600*24*7)),
        day: row => new Date(row.date).getDay() || 7,
        hour: row => parseInt(row.time.split(":")[0]),
        type: "Event name",
        page: "Event context",
      });
      break;
    }
  }
  async function processStudentFile() {
    for await (let [fileName, fileHandle] of dirHandle.entries()) if (fileName.includes(" Grades-")) {
      let file = await fileHandle.getFile();
      let text = await file.text();
      let data = Papa.parse(text.trim(), {header: true, dynamicTyping: true}).data;
      students = new Table(data);
      students.select({
        name: row => row["First name"] + " " + row.Surname,
        zid: "Username",
        active: row => row.Suspended === "Yes" ? 0 : 1,
        mark: row => row["Course total (Real)"] >= 0 ? Math.round(row["Course total (Real)"]) : null,
        grade: row => row["Course total (Letter)"] ?? Ufuncs.markGrade(row.mark),
      });
      break;
    }
  }
  function calculateDurations() {
    console.time("Durations");
    let id = 1;
    events.update({id: row => id++, timestamp: row => (new Date(row.date+"T"+row.time+":00")).getTime()/60000});
    let durations = events.copy()
      .group("user")
      .select({dummy: row => "dummy", ids: "id", durations: row => row.timestamp.reverse().nextMinus().reverse()})
      .group("dummy")
      .update({ids: row => row.ids.flat(), durations: row => row.durations.flat()});
    let extras = new Table();
    extras.insert({id: durations.column("ids")[0]});
    extras.insert({mins: durations.column("durations")[0]});
    events.ljoin(extras);
    events.delete("id", "timestamp");
    console.timeEnd("Durations");
  }
</script>
