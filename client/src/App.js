import React,{Suspense,useState,useEffect} from 'react'
import {Route, Switch,Redirect} from "react-router-dom"
import { connect } from 'react-redux'
import Login from './components/login'
import Error from './components/error'
import Register from './components/register'
import Home from './components/home'
import Navbar from './components/navbar'
import * as actions from './store/actions/index'
import './scss/index.scss'


const App = props => {
  const[myerror, setMyerror] = useState(props.userError)
  useEffect(() => {
    props.onTryAutoSignup()
  },[])

  useEffect(()=>{
    setMyerror(props.userError)
  },[props.userError])

  let routes = (
    <Switch>
      <Route exact path="/register" component={Register } />
      <Route exact path="/login" component={Login} />
      <Redirect to="/login" />
    </Switch>
  );
  if (props.isAuthenticated) {
    routes = (
      <Switch>
        <Route exact path="/home" component={Home} />
        <Redirect to="/home" />
      </Switch>
    );
  }
  return (
  <Suspense fallback={(<h1>Loading...</h1>)}>
    <div className="app">
      {myerror?<Error error={props.userError} />:null}
      <Navbar />
      {routes}
    </div>
  </Suspense>
  );
}


const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null,
    userError:state.auth.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(App)
