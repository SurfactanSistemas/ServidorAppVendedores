import React from 'react';
import InputMask from 'react-input-mask';
import Loader from 'react-loader-spinner';
import './App.css';
import {fetchPost} from './Auxis/Helpers';

const FechaEsAnterior = (Actual = '', AComparar = '') => {
    console.table({Actual, AComparar});
    return parseInt(Actual.split('/').reverse().join('')) < parseInt(AComparar.split('/').reverse().join(''))
}

const getFechaActual = () => {
    const _fechaActual = new Date();
    return _fechaActual.getDate() + '/' + (_fechaActual.getMonth()+1).toString().padStart(2, '0') + '/' + _fechaActual.getFullYear()
};

class App extends React.Component {
    // Controles.
    _cuitLoginInput = null;
    _cuitRegisterInput = null;
    _passLoginInput = null;
    _passRegisterInput = null;
    _confirmPassInput = null;
    _activeControls = false;
    _RegisterMode = false;
    _loggedIn = false;
    _Loading = true;
    _IDProveedor = 0;
    MsgGeneral = '';

    WProv = {
        Nombre: '',
        ID: 0,
        Habilitado: '0',
        FechaAnotacion: ''
    };
    
    constructor(props){
        super(props);
        this.state = {value:'', pass: '', confirmPass: '', ProximaFechaAnotacion: '', FechaInicio: '', MsgGeneral: '', errorMsg: '', successMsg: '', _Loading: false, _RegisterMode: false, WProv: {
            Nombre: '',
            ID: 0,
            Habilitado: '0',
            FechaAnotacion: ''
        }};
    }
    
    render(){
        return (
            <div className="App">
                <header className="App-header" style={{ paddingTop: (!this.state._loggedIn) ? '3em' : '1.5em' }}>
                    <div className={this.state._loggedIn ? "col-xs-1 col-md-3" : "col-xs-1 col-md-2"}></div>
                    <div className={this.state._loggedIn ? "col-xs-10 col-md-6" : "col-xs-10 col-md-4"}>
                        <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                            BIENVENIDO
                        </p>
                        { this.renderForms() }
                    </div>
                </header>
            </div>
        );
    }
    
    /**
     * Pantallas.
     */
    renderForms = () => {
        return (
            <div>
                {/* {<div style={{ display: this.state.MsgGeneral !== '' ? 'block' : 'none'}} className="panel panel-info">{this.state.MsgGeneral}</div> } */}
                {
                    <div style={{ display: this.state.MsgGeneral !== '' ? 'block' : 'none'}} className="panel panel-info">
                        <div className="panel-heading">
                            <h3 className="panel-title">Aviso Importante</h3>
                        </div>
                        <div className="panel-body">
                            {this.state.MsgGeneral}
                        </div>
                    </div>
                }
                {this.renderLoadingView()}
                {this.renderLoginForm()}
                {this.renderMainPage()}
                {this.renderRegistroProveedor()}
            </div>
        );
    }

    renderLoadingView = () => {
        return (
            <div style={{ display: this.state._Loading ? 'block' : 'none' }}>
                <Loader
                    type="Rings"
                    color="#00BFFF"
                    height="120"	
                    width="120"
                />
            </div>
        );
    }

    renderMainPage = () => {
        return (
            <div style={{ display: this.state._loggedIn ? 'block' : 'none' }}>
                <form action="/" onSubmit={this.onSuscribeSubmitHandle}>
                    <div className="form-group">
                        { this.state.errorMsg !== '' ? <div className="alert alert-danger" role="alert">{this.state.errorMsg}</div> : null }
                        { this.state.successMsg !== '' ? <div className="alert alert-success" role="alert">{this.state.successMsg}</div> : null }
                        <div className="alert alert-primary" role="alert">
                            <p><span style={{fontWeight: 'bold', textTransform: 'uppercase', fontSize: '2rem'}}>{this.state.WProv.Nombre}</span></p>
                            {this.renderAvisoFechasSelectivo()}
                        </div>
                        <input disabled={this.state._activeControls || this.state.WProv.FechaAnotacion !== '' || FechaEsAnterior(getFechaActual(), this.state.FechaInicio)} type="submit" value="ANOTARSE PARA PAGO SEMANAL" className="form-control btn btn-success btn-block btn-anotarse"/>
                        <button onClick={this.onLogOutClick} style={{color: 'white'}} className="form-control btn btn-link btn-block">CERRAR SESIÓN</button>
                    </div>
                </form>
            </div>
        );
    }

    renderLoginForm = () => {
        return (
            <div style={{ display: !this.state._RegisterMode && !this.state._Loading && !this.state._loggedIn ? 'block' : 'none' }}>
                <form action="/" onSubmit={this.onSubmitHandle}>
                    <div className="form-group">
                        <InputMask disabled={this.state._activeControls} type="text" name="cuit" placeholder="Ingrese su CUIT" value={this.state.value} mask={'99-99999999-9'} maskChar={' '} className="form-control text-center" onChange={e => this.handleCuitOnChange(e)} autoFocus inputRef={c => this._cuitLoginInput = c} />
                    </div>
                    <div className="form-group">
                        <input disabled={this.state._activeControls} type="password" name="pass" placeholder="Ingrese su Contraseña" value={this.state.pass} className="form-control text-center" onChange={e => this.handlePasswordOnChange(e)} ref={c => this._passLoginInput = c} />
                    </div>
                    <div className="form-group">
                        { this.state.errorMsg !== '' ? <div className="alert alert-danger" role="alert">{this.state.errorMsg}</div> : null }
                        { this.state.successMsg !== '' ? <div className="alert alert-success" role="alert">{this.state.successMsg}</div> : null }
                        <input disabled={this.state._activeControls} type="submit" value="INGRESAR" className="form-control btn btn-success btn-block"/>
                        <button onClick={this.toggleRegisterMode} style={{color: 'white'}} className="form-control btn btn-link btn-block">REGISTRARSE</button>
                    </div>
                </form>
            </div>
        );
    }

    renderRegistroProveedor = () => {
        return (
            <div style={{ display: this.state._RegisterMode && !this.state._Loading && !this.state._loggedIn ? 'block' : 'none' }}>
                <form action="/" onSubmit={this.onRegisterSubmitHandle}>
                    <div className="form-group">
                        <InputMask disabled={this.state._activeControls} type="text" name="cuit" placeholder="Ingrese su CUIT" value={this.state.value} mask={'99-99999999-9'} maskChar={' '} className="form-control text-center" onChange={e => this.handleCuitRegisterOnChange(e)} autoFocus inputRef={c => this._cuitRegisterInput = c} />
                    </div>
                    <div className="form-group">
                        <input disabled={this.state._activeControls} type="password" name="pass" placeholder="Ingrese su Contraseña" value={this.state.pass} className="form-control text-center" onChange={e => this.handlePasswordRegisterOnChange(e)} ref={c => this._passRegisterInput = c} />
                    </div>
                    <div className="form-group">
                        <input disabled={this.state._activeControls} type="password" name="confirm-pass" placeholder="Confirme su Contraseña" value={this.state.confirmPass} className="form-control text-center form-danger" onChange={e => this.handleConfirmPasswordOnChange(e)} ref={c => this._confirmPassInput = c} />
                    </div>
                    <div className="form-group">
                        { this.state.errorMsg !== '' ? <div className="alert alert-danger" role="alert">{this.state.errorMsg}</div> : null }
                        { this.state.successMsg !== '' ? <div className="alert alert-success" role="alert">{this.state.successMsg}</div> : null }
                        <input disabled={this.state._activeControls} type="submit" value="REGISTRARSE" className="form-control btn btn-success btn-block" />
                        <button onClick={this.toggleRegisterMode} style={{color: 'white'}} className="form-control btn btn-link btn-block">INGRESAR</button>
                    </div>
                </form>
            </div>
        );
    }
    
    renderAvisoFechasSelectivo() {

        if (this.state.WProv.FechaAnotacion === ''){
            if (FechaEsAnterior(getFechaActual(), this.state.FechaInicio)){
                return (
                    <div>
                        <p>
                            El período actual para poder anotarse para la Fecha de Pago {this.state.ProximaFechaAnotacion}, se ecnuentra cerrada.
                            El próximo comienza el {this.state.FechaInicio} con Fecha de Pago {this.state.ProximaFechaAnotacion}. 
                            <button disabled={this.state._activeControls} className="btn btn-block btn-primary btn-anotarse" onClick={this.onSuscribeSubmitHandle}>
                                ¿Desea anotarse para la Fecha {this.state.ProximaFechaAnotacion}?
                                <br/>
                                Haga click acá
                            </button>
                        </p>
                    </div>
                )
            }else{
                return (
                    <p style={{ opacity: this.state.ProximaFechaAnotacion !== '' ? '1' : '0' }}>
                        Recuerde que se está anotando para los pagos que se realizarán el día {this.state.ProximaFechaAnotacion}.
                    </p>
                )
            }
        }else if (this.state.WProv.FechaAnotacion !== ''){
            return (
                <p style={{ opacity: this.state.WProv.FechaAnotacion !== '' ? '1' : '0' }}>
                    Recuerde que ya se encuentra anotado para la Fecha {this.state.WProv.FechaAnotacion}.
                </p>
            )
        }
    }

    /**
     * Handles.
     */
    handlePasswordOnChange(e) {
        this.setState({ pass: e.target.value, errorMsg: '', successMsg: '' });
    }

    handleConfirmPasswordOnChange(e) {
        this.setState({ confirmPass: e.target.value, errorMsg: '', successMsg: '' });
    }

    handleCuitOnChange(e) {
        this.setState({ value: e.target.value, errorMsg: '' });
    }

    handleCuitRegisterOnChange(e) {
        this.setState({ value: e.target.value, errorMsg: '' });
    }

    handlePasswordRegisterOnChange(e) {
        this.setState({ pass: e.target.value, errorMsg: '', successMsg: '' });
    }
    /**
     * Eventos.
     */
    onSuscribeSubmitHandle = async (e) => {
        e.preventDefault();
        
        try {
            
            this.setState({
                _Loading: true
            }, async () => {

                const req = await fetchPost('/AnotarProveedorSelectivo', {IDProveedor: this.state.WProv.ID});
                const res = await req.json();
                
                const MsgError = !res.resultados ? 'No se ha podido realizar el Proceso de Anotación en el Sistema. Por favor, pruebe nuevamente en unos minutos.' : '';
                const MsgExito = res.resultados ? '¡Operación realizada con éxito! Recuerde que en caso de tener algún Pago disponible se estará avisando por E-Mail.' : '';

                this.setState({
                    _Loading: false,
                    successMsg: MsgExito,
                    errorMsg: MsgError,
                    _activeControls: res.resultados
                });

            });
        } catch (error) {
            console.log(error)   
            this.setState({
                _Loading: false,
                successMsg: '',
                errorMsg: `Ha ocurrido un error al querer realizar la operación. <${error}>`
            });
        }
    }

    onRegisterSubmitHandle = async (e) => {
        e.preventDefault();
        
        if (this.state.value.toString().replace(' ', '').length < 13){
            this._cuitLoginInput.focus()
            return;
        }
    
        if (this.state.pass.trim() === ''){
            this.setState({errorMsg: 'Debe indicar la contraseña.', successMsg: ''}, () => this._passRegisterInput.focus());
            return;
        }
    
        if (this.state.confirmPass.trim() === ''){
            this.setState({errorMsg: 'Debe confirmar la contraseña.', successMsg: ''}, () => this._confirmPassInput.focus());
            return;
        }
        
        if (this.state.pass !== this.state.confirmPass){
            this.setState({errorMsg: 'Las contraseñas no coinciden.', successMsg: ''}, () => this._confirmPassInput.focus());
            return;
        }

        this.toggleActiveControls();
        
        this.setState({
            _Loading: true
        });

        try {
            const req = await fetchPost('/RegistrarNuevoProveedor',{Cuit: this.state.value, Password: this.state.pass});
            const res = await req.json(); 
            console.log(res);
            // Controlamos que el Proveedor no se haya registrado con anterioridad al Sistema.
            if (res.error){
                this.setState({
                    _Loading: false,
                    successMsg: '',
                    errorMsg: `${res.errMsg}.`
                });
                return;
            }
            // En caso de que se haya registrado correctamente, mostramos mensaje y mostramos el formulario de Inicio de Sesión.
            this.setState({
                successMsg: '¡Registro de Proveedor Correcto! Inicie sesión con las credenciales que indicó anteriormente.',
                _RegisterMode: false,
                _Loading: false
            }, () => {
                this._cuitLoginInput.focus();
            });

        } catch (error) {
            console.error(error);
            this.setState({
                _Loading: false,
                successMsg: '',
                errorMsg: `No se ha podido realizar el Proceso de Registración en el Sistema. Por favor, pruebe nuevamente en unos minutos. <${error}>`
            });
        }
        this.toggleActiveControls();
    }
    
    onSubmitHandle = async (e) => {
        e.preventDefault();

        if (this.state.value.toString().replace(' ', '').length < 13){
            
            this._cuitLoginInput.focus()
            return;
        }
    
        if (this.state.pass.trim() === ''){
            this.setState({errorMsg: 'Debe indicar la contraseña.', successMsg: ''}, () => this._passLoginInput.focus());
            return;
        }

        this.toggleActiveControls();
        this.setState({
            _Loading: true
        });
        try {
            const req = await fetchPost('/CheckExistencia', {Cuit: this.state.value, Password: this.state.pass});
            const res = await req.json();

            if (!res.resultados){
                this.setState({
                    _Loading: false,
                    successMsg: '',
                    _activeControls: false,
                    errorMsg: `Las credenciales que se han indicado no son correctas.`
                }, () => this._cuitLoginInput.focus());
                return;
            }
            const logInReq = await fetchPost('/Login', {Cuit: this.state.value, Password: this.state.pass});
            const logInRes = await logInReq.json();

            if (logInRes.resultados.length === 0){
                this.setState({
                    _Loading: false,
                    successMsg: '',
                    _activeControls: false,
                    errorMsg: `Las credenciales que se han indicado no son correctas.`
                }, () => this._cuitLoginInput.focus());
                return;
            }

            let Prv = this.state.WProv;

            if (logInRes.resultados && logInRes.resultados.length > 0 ) Prv = logInRes.resultados[0];

            const WSelectivoConfig = await fetchPost('/SelectivoConfig');
            let {resultados: [SelectConfig]} = await WSelectivoConfig.json();
            let FechaAnot = '';
            let MsgGral = '';
            let FechaIni = '';
            
            if (SelectConfig){
                FechaAnot = SelectConfig.Fecha || '';
                FechaIni = SelectConfig.FechaInicio || '';
                MsgGral = SelectConfig.Msg || '';
            }

            console.table({FechaAnot, FechaIni, MsgGral})

            this.setState({
                errorMsg: '', successMsg: '', MsgGeneral: MsgGral, ProximaFechaAnotacion: FechaAnot, FechaInicio: FechaIni, _loggedIn: true, _Loading: false, WProv: Prv
            });

        } catch (error) {
            console.error(error);
            this.setState({
                _Loading: false,
                successMsg: '',
                errorMsg: `No se ha podido Iniciar Sesión en el Sistema. Por favor, pruebe nuevamente en unos minutos. <${error}>`
            });
        }
        this.toggleActiveControls();
    }

    onLogOutClick = (e) => {
        e.preventDefault();
        this.setState({ 
            errorMsg: '', successMsg: '', _loggedIn: false, _RegisterMode: false,
            value: '', pass: '', confirmPass: '', _Loading: false, MsgGeneral: '', _activeControls: false
        }, () => {
            this._cuitLoginInput.focus();
        });
    }
    
    /**
     * Varios.
     */
    toggleActiveControls = () => this.setState({_activeControls: !this.state._activeControls, _Loading: false});
    toggleRegisterMode = () => this.setState({
        _RegisterMode: !this.state._RegisterMode, errorMsg: '', successMsg: '', _loggedIn: false, pass: '', confirmPass: '', _Loading: false
    }, () => !this.state._RegisterMode ? this._cuitLoginInput.focus() : this._cuitRegisterInput.focus() );
}

export default App;
