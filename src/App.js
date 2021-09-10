import React, { useState } from 'react';
import {Line} from 'react-chartjs-2';
import Axios from 'axios';
import exportFromJSON from 'export-from-json' ;
import { registerables } from 'chart.js';



const divStyle = {
  position: 'relative',
  height: '40vh',
  width: '20vw'
};


function npointsMA(n, price){

   let init_sum = 0;

  for (var i = 0; i < n; i++){
    init_sum += price[n];
}

  const movemean = [];
  for (var i = n-1; i < price.length; i++){
      movemean.push(init_sum/n)
      init_sum -= price[i - n + 1]
      init_sum += price[i + 1]
  }
  return movemean
}


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '',
      from_dtime: '',
      to_dtime: '',
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
      url: 'https://metal-price-backend.herokuapp.com/silver',
      //headers: {"Content-Type": "application/json"},
      data: {
        year: this.state.year,
        from_dtime: this.state.from_dtime,
        to_dtime: this.state.to_dtime,
      }}).then((res) => {
        console.log("here");
        this.setState({
          isLoaded: true,
          query_data: res.data
        })


        var x = [];
        var y = [];

        for (var i in this.state.query_data){
          x.push(this.state.query_data[i].dtime);
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
            data: this.state.price,
            radius: 0,
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
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
            Year:
            <input
              name="year"
              type="text"
              value={this.state.year}
              onChange={this.handleChange} />
          </label>
          <label>
            Start Date:
            <input
              name="from_dtime"
              type="text"
              value={this.state.from_dtime}
              onChange={this.handleChange} />
          </label>
          <label>
            End Date:
            <input
              name="to_dtime"
              type="text"
              value={this.state.to_dtime}
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
