import React,{Component} from 'react';
import { Modal,Effect} from 'react-dynamic-modal';

class MyModal extends Component{
   render(){
      const { titulo, cuerpo, onRequestClose, onModalClose } = this.props;
      return (
         <Modal
            onRequestClose={onRequestClose}
            effect={Effect.ScaleUp}>
            <h1>{titulo}</h1>
            <p>{cuerpo}</p>
            <button className="btn btn-primary btn-block" onClick={onModalClose}>Entendido</button>
         </Modal>
      );
   }
}

export default MyModal;