import React, { useState } from 'react';
import './App.css';
import {Line} from 'react-chartjs-2';
import Axios from 'axios';
import exportFromJSON from 'export-from-json' ;
import { registerables } from 'chart.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.css';




const divStyle = {
  position: 'relative',
  height: '40vh',
  width: '20vw'
};


function npointsMA(n, price){
  let n_points = n * 24; 
  let init_sum = 0;

  for (var i = 0; i < n_points; i++){
    init_sum += price[i];
}

  console.log(init_sum);
  const movemean = [];

  for (var i = 0; i < n_points-1; i++){
    movemean.push(null);
  }

  for (var i = n_points-1; i < price.length; i++){
      movemean.push(init_sum/n_points)
      init_sum -= price[i - n_points + 1]
      init_sum += price[i + 1]
  }
  return movemean
}


//5 10 20 60 120 144 250 
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
      showdownload: '',
      avg5: false,
      avg10: false,
      avg20: false,
      avg60: false


    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handledwnload = this.handledwnload.bind(this);
    this.Dwnloadbtn = this.Dwnloadbtn.bind(this);
  }

//handle change


  handleChange(event) {
    console.log(event.target.name, event.target.value);
    this.setState({[event.target.name]:event.target.value});
    }

  handleSubmit(event) {
    event.preventDefault();
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
            label: "Silver price",
            data: this.state.price,
            radius: 0,
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          },
          {
            label: "5 day average",
            data: npointsMA(5,this.state.price),
            radius: 0,
            borderColor: 'rgba(255, 51, 51, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          },
          {
            label: "20 day average",
            data: npointsMA(20,this.state.price),
            radius: 0,
            borderColor: 'rgba(0, 128, 255, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          },
          {
            label: "60 day average",
            data: npointsMA(60,this.state.price),
            radius: 0,
            borderColor: 'rgba(0, 128, 255, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          },
          {
            label: "144 day average",
            data: npointsMA(144,this.state.price),
            radius: 0,
            borderColor: 'rgba(0, 128, 255, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          }
        ]
        };

        const options = {
          scales: {
            xAxes: [{
              ticks: {
                maxTicksLimit: 30
              }
            }]
          },
          responsive: true,
          maintainAspectRatio:false,
          layout: {
            padding: {
              top: 10,
              left: 80,
              right: 5,
              bottom: 15
            }
          }
        }

        this.setState({
          graph: <div className="linechart">
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
      const filename = `silver_price_${this.state.from_dtime}-${this.state.to_dtime}`;
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
      //return <button onClick={this.handledwnload}> Download </button>;
      return <Button onClick={this.handledwnload} variant='outline-dark'>Download</Button>;
    }




  render() {
    return (
      <>
      <div class="flexbox-container">
        <Form onSubmit = {this.handleSubmit} className = 'settings'>
          <Form.Group className="mb-3" >
            <Form.Label>Year</Form.Label>
              <Form.Control 
                name="year" type="number" placeholder="YYYY"               
                value={this.state.year}
                onChange={this.handleChange}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>From Date</Form.Label>
              <Form.Control 
                name="from_dtime" type="text" placeholder="YYYY-MM-DD"               
                value={this.state.from_dtime}
                onChange={this.handleChange.bind(this)}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>To Date</Form.Label>
              <Form.Control 
                name="to_dtime"type="text" placeholder="YYYY-MM-DD"               
                value={this.state.to_dtime}
                onChange={this.handleChange.bind(this)}/>
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
        {this.state.graph}
        <div>
        {this.state.showdownload}
        </div>

      </div>
      
      
      </>
    );
  }
}
