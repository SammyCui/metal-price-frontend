import React, { useState } from 'react';
import {Line} from 'react-chartjs-2';
import Axios from 'axios';
import exportFromJSON from 'export-from-json' ;



const divStyle = {
  position: 'relative',
  height: '40vh',
  width: '20vw'
};


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: '',
      end: '',
      isLoaded: false,
      query_data: [],
      date: [],
      price: [],
      graph: '',
      showdownload: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handledwnload = this.handledwnload.bind(this);
    this.Dwnloadbtn = this.Dwnloadbtn.bind(this);
  }

//handle change


  handleChange(event) {
    this.setState({[event.target.name]:event.target.value});
    }

  handleSubmit(event) {
    console.log("there");
    Axios({
      method: 'post',
      url: 'http://localhost:3000',
      //headers: {"Content-Type": "application/json"},
      data: {
        start: this.state.start,
        end: this.state.end
      }}).then((res) => {
        console.log("here");
        this.setState({
          isLoaded: true,
          query_data: res.data
        })


        var x = [];
        var y = [];

        for (var i in this.state.query_data){
          x.push(this.state.query_data[i].datetime);
          y.push(this.state.query_data[i].price);
        }

        this.setState({
          date: x,
          price: y
        })

        const data = {
          labels: this.state.date,
          datasets: [{
            label: "Silver price chart",
            data: this.state.price
          }]
        };

        const options = {
          scales: {
            xAxes: [{
              ticks: {
                maxTicksLimit: 30
              }
            }]
          }
        }

        this.setState({
          graph: <div class="chart-container">
                  <Line
                    data = {data}
                    options= {options}
                    />
                  </div>
        });

        this.setState({
          showdownload: <button onClick={this.handledwnload}> Download </button>
        })


      });
      event.preventDefault();
    }

    handledwnload(event) {
      const data = this.state.query_data;
      const filename = `silver_price_${this.state.start}-${this.state.end}`;
      const exportType = 'csv'
      exportFromJSON({data, filename, exportType});
    }

    Dwnloadbtn(){
      /*
      if (this.state.showdownload){
        return (<button onClick={this.handledwnload}> Download </button>);
      }
      else{
        return (<div> </div>);
      }
      */
      return <button onClick={this.handledwnload}> Download </button>;
    }




  render() {
    return (
      <>
      <div>
        <form onSubmit = {this.handleSubmit}>
          <label>
            start:
            <input
              name="start"
              type="text"
              value={this.state.start}
              onChange={this.handleChange} />
          </label>
          <br />
          <label>
            end:
            <input
              name="end"
              type="text"
              value={this.state.end}
              onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>

      {this.state.graph}
      {this.state.showdownload}
      </>
    );
  }
}
