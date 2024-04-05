import {toast } from 'react-toastify';
 
const notify = (message, type) => {
    switch (type) {
      case 'info':
        toast.info(message);
        break;
      case 'success':
        toast.success(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message);
    }
  };
 
export default notify