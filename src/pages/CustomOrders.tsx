import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CustomOrder {
  id: string;
  color: string;
  createdAt: any;
  customerName: string;
  customerPhone: string;
  designFileName: string;
  designUrl: string; // This is the URL for the image
  notes: string;
  productType: string;
  quantity: number;
  sizes: string[];
  status: string;
}

export default function CustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'customOrders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomOrder[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching custom orders:', error);
      toast.error('Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'customOrders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this custom order?')) return;

    try {
      await deleteDoc(doc(db, 'customOrders', orderId));
      setOrders(orders.filter(order => order.id !== orderId));
      toast.success('Custom order deleted successfully');
    } catch (error) {
      console.error('Error deleting custom order:', error);
      toast.error('Failed to delete custom order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer custom design orders
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No custom orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.productType}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Custom Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Customer Name</h3>
                  <p className="text-muted-foreground">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Product Type</h3>
                  <p className="text-muted-foreground">{selectedOrder.productType}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quantity</h3>
                  <p className="text-muted-foreground">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Color</h3>
                  <p className="text-muted-foreground">{selectedOrder.color}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Status</h3>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Sizes</h3>
                <div className="flex gap-2">
                  {selectedOrder.sizes.map((size, index) => (
                    <Badge key={index} variant="secondary">{size}</Badge>
                  ))}
                </div>
              </div>

              {/* --- New Design File/Image View Section --- */}
              <div className="border p-4 rounded-md">
                <h3 className="font-semibold mb-2">Design File</h3>
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground truncate max-w-xs">{selectedOrder.designFileName}</p>
                    {selectedOrder.designUrl && (
                        <a 
                            href={selectedOrder.designUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                        >
                            <ImageIcon className="h-4 w-4" />
                            View Design
                        </a>
                    )}
                </div>
              </div>
              {/* --- End New Section --- */}

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-1">Order Date</h3>
                <p className="text-muted-foreground">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}