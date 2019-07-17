import React,{Component} from 'react';
import { Modal,Effect} from 'react-dynamic-modal';

class MyModal extends Component{
   render(){
      let { titulo, cuerpo, onRequestClose, onModalClose, stylesBtn } = this.props;
      stylesBtn = stylesBtn || 'btn-primary';
      return (
         <Modal
            style={{content: {width: '50%', minWidth: '400px', padding: '10px'}}}
            onRequestClose={() => onRequestClose}
            effect={Effect.ScaleUp}>
            <div className="ventana-modal col-xs-12">
               <h4>{titulo}</h4>
               { cuerpo.map((c, i) => (
                  <p key={i}>{c}</p>
               )) }
               <button className={`btn btn-block ${stylesBtn}`} onClick={onModalClose}>Entendido</button>
            </div>
         </Modal>
      );
   }
}

export default MyModal;