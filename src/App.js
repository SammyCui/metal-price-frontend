import React from 'react';
import './App.css';
import {Line} from 'react-chartjs-2';
import Axios from 'axios';
import exportFromJSON from 'export-from-json' ;
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.css';
import { DropdownButton,Dropdown } from 'react-bootstrap';




const divStyle = {
  position: 'relative',
  height: '40vh',
  width: '20vw'
};


function npointsMA(n, price){
  let n_points = n; 
  let init_sum = 0;

  for (var i = 0; i < n_points; i++){
    init_sum += price[i];
}

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
      data_name: 'deag.csv',
      file_list: [],
      dropdown_name: 'Select a file'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handledwnload = this.handledwnload.bind(this);
    this.Dwnloadbtn = this.Dwnloadbtn.bind(this);
    this.handleGetFileList = this.handleGetFileList.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
    
  }

//handle change


  handleChange(event) {
    this.setState({[event.target.name]:event.target.value});
    }

  handleSubmit(event) {
    event.preventDefault();
    console.log({
      from_date: this.state.from_dtime,
      to_date: this.state.to_dtime,
      data_name: this.state.data_name
    })
    Axios({
      method: 'post',
      url: `https://metal-price-backend.herokuapp.com/getdata/${this.state.data_name}`,
      //headers: {"Content-Type": "application/json"},
      data: {
        from_date: this.state.from_dtime,
        to_date: this.state.to_dtime,
        data_name: this.state.data_name
      }}).then((res) => {
        this.setState({
          isLoaded: true,
        })

        var x = [];
        var y = [];

        let json_parsed = JSON.parse(res.data)
        for (let i in json_parsed){
          x.push(json_parsed[i].Datetime);
          y.push(json_parsed[i].price);

        }

        console.log(x)

        const data = {
          labels: x,
          datasets: [{
            label: "Silver price",
            data: y,
            radius: 0,
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          },
          {
            label: "5 day average",
            data: npointsMA(5,y),
            radius: 0,
            borderColor: 'rgba(255, 51, 51, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          },
          {
            label: "20 day average",
            data: npointsMA(20,y),
            radius: 0,
            borderColor: 'rgba(0, 128, 255, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          },
          {
            label: "60 day average",
            data: npointsMA(60,y),
            radius: 0,
            borderColor: 'rgba(0, 128, 255, 0.8)',
            borderWidth: 1,
            fill: false,
            hidden: true
          },
          {
            label: "144 day average",
            data: npointsMA(144,y),
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
    };

    handleGetFileList(event){
      Axios({
        method: 'get',
        url: `https://metal-price-backend.herokuapp.com/get_file_list`,
        }).then((res) => {
          this.setState({
            file_list: res.data
          })});
    };

    handleFileSelect(event,evtkey){
      this.setState({
        dropdown_name: event.target.attributes.getNamedItem('title').value,
        data_name: event.target.attributes.getNamedItem('title').value
      });
      
    };

    handledwnload(event) {
      const data = this.state.query_data;
      const filename = `silver_price_${this.state.from_dtime}-${this.state.to_dtime}`;
      const exportType = 'csv'
      exportFromJSON({data, filename, exportType});
    };


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
    };

    dropdown(){
      return(
        <div>
          <DropdownButton id = 'file-list-dropdown-button' 
          title={this.state.dropdown_name} 
          onClick = {this.handleGetFileList}
          onSelect = {(eventKey) => {
            this.setState({
              dropdown_name: eventKey,
              data_name: eventKey
            });
          }}>
            {this.state.file_list.map(data => (
              <Dropdown.Item eventKey={data} key={data}>{data}</Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
      )
    }







  render() {
    return (
      <>
      <div class="flexbox-container">
        <Form onSubmit = {this.handleSubmit} className = 'settings'>
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
        <div>
          {this.dropdown()}
        </div>
        {this.state.graph}
        <div>
        {this.state.showdownload}
        </div>

      </div>
      
      
      </>
    );
  }
}
