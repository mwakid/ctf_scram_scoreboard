import dpkt

class NetFlowV5(object):
    
    def handle(self,data):
        nf = dpkt.netflow.Netflow5(data) 
      
        print "seq:%s, engine:%s"%(nf.flow_sequence,nf.engine_id)
        #we are not using the header portion of the NetFlow Flow, only the NetFlow records
        #    so we are just returning the array of NetFlow Records, which is an iterable
        return nf.data  