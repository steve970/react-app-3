import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryVoronoiContainer, VictoryLabel } from 'victory';

function dateTimeCfs (data) {
  let arrangedData = []
  data.map((dateCfs ,index, array) => {
    delete dateCfs.qualifiers
    return arrangedData.push({"dateTime": dateCfs.dateTime,"value":parseInt(dateCfs.value, 10)})
  })
  return arrangedData
}

function dwrDateTimeCfs (data) {
  let x = new Date()
  x = x.setDate(x.getDate() - 7)

  let arrangedData = []
  data.map((dateCfs ,index, array) => {
    if (dateCfs.parameter === 'GAGE_HT') {
      return
    } else if (new Date(dateCfs.measDateTime) <= x) {
      return
    } else {
      delete dateCfs.parameter
      delete dateCfs.measUnit
      delete dateCfs.abbrev
      delete dateCfs.flagA
      delete dateCfs.flagB
      delete dateCfs.modified
      // tenDayWindow(dateCfs)
    }
    return arrangedData.push({"dateTime": dateCfs.measDateTime, "value":parseInt(dateCfs.measValue, 10)})
    // delete dateCfs.qualifiers
    // return arrangedData.push({"dateTime": dateCfs.dateTime,"value":parseInt(dateCfs.value, 10)})
  })
  console.log(arrangedData);
  return arrangedData
}

// class MyRiver extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       usgs_station_id: ""
//     };
//     this.handleChange = this.handleChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }
//
//   handleChange(event) {
//     this.setState({usgs_station_id: event.target.value});
//   }
//
//   handleSubmit(event) {
//     alert('A river was picked: ' + this.state.usgs_station_id);
//     event.preventDefault();
//   }
//
//   render() {
//     return (
//       <form onSubmit={this.handleSubmit}>
//         <label>
//           Pick your favorite river:
//           <select value={this.state.value} onChange={this.handleChange}>
//             <option value="09050700">Blue River Below Dillion</option>
//             <option value="lime">South Platte River - Cheesman Canyon</option>
//             <option value="06730200">Boulder Creek @ 75th</option>
//             <option value="mango">The Secret Spot</option>
//           </select>
//         </label>
//         <input type="submit" value="Submit" />
//       </form>
//     );
//   }
// }


class MyData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      abbrev: "",
      date_time_cfs: [],
      station_name:"",
      usgs_station_id:props.usgs_station_id ,
      isLoading: false,
      website_url:{}
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    fetch(this.props.url, {   //period = is equivalent to 3 day time period-should be able to edit
      method: 'GET'
    })
      .then(res => res.json())
      .then(
        (result) => {

          if (this.props.urlMarker === 0) {
            let usgsStationAbbrev = result.ResultList[0].abbrev
            let dwrTimeCfs = dwrDateTimeCfs(result.ResultList);


            this.setState({
              station_name: "SOUTH PLATTE RIVER BELOW CHEESMAN RESERVOIR (PLACHECO)",
              abbrev: usgsStationAbbrev,
              date_time_cfs:dwrTimeCfs,
              isLoading: false,
            })
          } else {

            let usgsStationId = result.value.timeSeries[0].sourceInfo.siteCode[0].value
            let stationName = result.value.timeSeries[0].sourceInfo.siteName

            this.setState({
              usgs_station_id: result.value.timeSeries[0].sourceInfo.siteCode[0].value,
              station_name: result.value.timeSeries[0].sourceInfo.siteName,
              date_time_cfs: dateTimeCfs(result.value.timeSeries[0].values[0].value),
              isLoading: false,
            });
          }

        },
        (error) => {
          this.setState({
            error
          });
        }
      )
  }

  render() {
    const {error, station_name, date_time_cfs, isLoading} = this.state;
    if (error) {
      return <div>Error</div>
    } else if (isLoading) {
      return <div>{station_name} is loading...</div>
    } else {
      return (
        // <MyRiver />
        <VictoryChart
          containerComponent={
            <VictoryVoronoiContainer
              labels={(d) => (
                `CFS: ${d.datum.value}, Day: ${new Date(d.datum.dateTime)}`
              )}
            />
          }
          padding={{ top: 50, bottom: 50, left: 100, right: 600 }}
          theme={VictoryTheme.material}
          domain={{x: [0, 700], y: [0, 300]}}
          scale={{ x: "linear" }}
          width={1500}
        >
          <VictoryLabel text={station_name} x={225} y={30} textAnchor="middle"/>
          <VictoryAxis
            tickCount={7}
            style={{
              tickLabels: {fontSize: 5, padding: 5}
            }}
            tickFormat={(tick) => (
              new Date(tick).toGMTString().slice(0,16)
            )}
          />
          <VictoryAxis
            dependentAxis

            standAlone={false}
          />
          <VictoryLine
            style={{
              data: { stroke: "#c43a31", strokeWidth: .25 },
              parent: { border: ".5px solid #ccc"},
            }}
            interpolation="natural"
            data={date_time_cfs}
            title={station_name}
            x="dateTime"
            y="value"
          />
        </VictoryChart>
      )
    }
  }
}


ReactDOM.render([
  <MyData url='https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeseriesraw/?abbrev=PLACHECO' urlMarker={0} />,
  <MyData url='https://waterservices.usgs.gov/nwis/iv?sites=09050700&period=P7D&format=json' urlMarker={1} />
], document.getElementById('root'));


//
// CHECK FLOWS EVERY 15 MINUTES
// CHANGE IN CFS FROM LAST WEEK +/-
