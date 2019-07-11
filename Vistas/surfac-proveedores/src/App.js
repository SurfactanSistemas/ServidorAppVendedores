import React from 'react';
import './App.css';
import MyModal from './Components/MyModal';
import { ModalManager } from 'react-dynamic-modal/lib/Modal';

class App extends React.Component {

  state = {value: ''}

  // Controles.
  _cuitInput = null;
  _passInput = null;

  constructor(props){
    super(props);
    this.state = {value:'', pass: ''}
  }

  onSubmitHandle = (e) => {
    e.preventDefault();
    this.openModal();
    this.setState({value: '', pass: ''})
  }

  onModalClose = () => {
    alert();
    ModalManager.close();
    this._cuitInput.focus();
  }

  openModal = () => {
    ModalManager.open(<MyModal titulo="Prueba" cuerpo="prueba de cuerpo" onRequestClose={true} onModalClose={this.onModalClose} />)
  }

  render(){
    return (
      <div className="App">
          <header className="App-header">
            <p>
              SURFACTAN S.A.
            </p>
            <p>{this.state.value}</p>
            <form action="/" onSubmit={this.onSubmitHandle}>
              <div className="form-group">
                <input type="text" name="cuit" placeholder="Ingrese su CUIT" value={this.state.value} className="form-control text-center" onChange={e => {this.setState({value: e.target.value})}} autoFocus ref={c => this._cuitInput = c} />
              </div>
              <div className="form-group">
                <input type="password" name="pass" placeholder="Ingrese su Contraseña" value={this.state.pass} className="form-control text-center" onChange={e => {this.setState({pass: e.target.value})}} ref={c => this._passInput = c} />
              </div>
              <div className="form-group">
                <input type="submit" value="Enviar" className="form-control btn btn-success btn-block" />                
              </div>              
            </form>
          </header>
      </div>
      
    );
  }
}

export default App;
