import React from 'react'
import { TailSpin } from "react-loader-spinner";

const Loader:React.FC = () => {
  return (
    <div>
    <TailSpin
            height="80"
            width="80"
            color="#ff0000"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
        />
    </div>
    
  )
}

export default Loader
