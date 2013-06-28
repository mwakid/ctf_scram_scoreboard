from twisted.internet.protocol import DatagramProtocol
from twisted.internet import reactor
import dpkt, json
from autobahn.websocket import WebSocketServerFactory, \
                            WebSocketServerProtocol, \
                               listenWS

class Collector(DatagramProtocol):

    def datagramReceived(self, data, (host, port)):      
        self.observer(data)

        
class PollServerProtocol(WebSocketServerProtocol):
       
    def connectionMade(self):
        WebSocketServerProtocol.connectionMade(self)#always before your code
        print "Connection Made"
        self.factory.connections.append(self)
        
    def connectionLost(self,reason):
        print "Connection Lost"
        self.factory.connections.remove(self)
        WebSocketServerProtocol.connectionLost(self, reason)#always after your code
        
    def onMessage(self, msg, binary):
        print"onMessage"
        for f in self.factory.observers:
            f(self,msg)
            
class Scoreboard():
    def __init__(self,reactor=reactor):
        self.reactor = reactor
        self.frontEndListeners={}
        self.collector = Collector()
        self.collector.observer = self._handlePoll
        self.reactor.listenUDP(6006, self.collector)
        self._setUpListener("poll", 9081, PollServerProtocol,self._handlePoll)
        self.reactor.run()
        
    def numIP2strIP(self,ip):
        '''
        this function convert decimal ip to dot notation
        '''
        l = [str((ip >> 8*n) % 256) for n in range(4)]
        l.reverse()
        return ".".join(l)   
    
    def _handlePoll(self,data):
        nf = dpkt.netflow.Netflow5(data) 
        
        for record in nf.data:

            resp = {'srcaddr':self.numIP2strIP(record.src_addr),
                 'dstaddr':self.numIP2strIP(record.dst_addr),
                 'bytes':record.bytes_sent}
        #make a json obj out of the setflow data
            print "Netflow Resp: %s sending to %s connections"%(resp, str(len(self.frontEndListeners['poll'].connections)))          
            if len(self.frontEndListeners['poll'].connections) > 0:
                for con in self.frontEndListeners['poll'].connections:
                    con.sendMessage(json.dumps(resp))  
        
    def _setUpListener(self, serviceName, port, protocol, handler=None):
        url = "ws://localhost:%d"%(port)       
        factory = WebSocketServerFactory(url, debug=False, debugCodePaths=False)    
        factory.protocol = protocol
        factory.setProtocolOptions(allowHixie76=True)
        
        #HACK: add an array for observing messages
        factory.observers = [] #called for every message; for the ui to listen
        
        if handler !=None:
            factory.observers.append(handler)
        
        factory.connections = [] #all connections that are active; for the protocol to send data
        self.frontEndListeners[serviceName] = factory
        listenWS(self.frontEndListeners[serviceName]) 
        
if __name__ == '__main__':
    scoreboard = Scoreboard()
    #client.main()