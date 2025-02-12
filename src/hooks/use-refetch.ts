import { useQueryClient } from "@tanstack/react-query"

const useRefetch = () => {
    const query = useQueryClient();
  return async ()=>{
    await query.refetchQueries({
        type:'active'
    })
  }
}

export default useRefetch;