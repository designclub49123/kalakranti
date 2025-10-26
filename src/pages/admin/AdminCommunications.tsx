import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageText, UserSquare, Send } from 'iconsax-react'; // Replaced Lucide with Iconsax

interface Recipient {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

export default function AdminCommunications() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'event' | 'custom'>('all');
  const [sending, setSending] = useState(false);
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');

  useEffect(() => {
    if (isAdmin) {
      fetchRecipients();
    }
  }, [isAdmin, recipientType]);

  const fetchRecipients = async () => {
    let query = supabase.from('profiles').select('id, full_name, email, phone');

    if (recipientType === 'event') {
      // Get users who have registered stalls
      const { data: stallUsers } = await supabase
        .from('stalls')
        .select('leader_id, members');
      
      if (stallUsers) {
        const userIds = new Set<string>();
        stallUsers.forEach(stall => {
          userIds.add(stall.leader_id);
          stall.members?.forEach((id: string) => userIds.add(id));
        });
        query = query.in('id', Array.from(userIds));
      }
    }

    const { data } = await query;
    if (data) setRecipients(data);
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.id));
    }
  };

  const handleSend = async () => {
    if (!message.trim() || selectedRecipients.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter a message and select recipients',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const selectedUsers = recipients.filter(r => selectedRecipients.includes(r.id));

      // Simulate sending (in production, this would call an edge function)
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: `${messageType === 'email' ? 'Emails' : 'Messages'} sent to ${selectedUsers.length} recipients`
      });

      setMessage('');
      setSelectedRecipients([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Communications</h1>
        <p className="text-muted-foreground">
          Send bulk emails or messages to participants
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserSquare size={20} color="currentColor" variant="Linear" /> {/* Replaced Users */}
              Select Recipients
            </CardTitle>
            <CardDescription>
              Choose who will receive your message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Group</Label>
              <Select value={recipientType} onValueChange={(val: any) => setRecipientType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="event">Event Participants</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recipients ({selectedRecipients.length} selected)</Label>
                <Button size="sm" variant="ghost" onClick={toggleAll}>
                  {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer"
                    onClick={() => toggleRecipient(recipient.id)}
                  >
                    <Checkbox
                      checked={selectedRecipients.includes(recipient.id)}
                      onCheckedChange={() => toggleRecipient(recipient.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{recipient.full_name}</p>
                      <p className="text-xs text-muted-foreground">{recipient.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {messageType === 'email' ? (
                <Message size={20} color="currentColor" variant="Linear" /> // Replaced Mail
              ) : (
                <MessageText size={20} color="currentColor" variant="Linear" /> // Replaced MessageSquare
              )}
              Compose Message
            </CardTitle>
            <CardDescription>
              Write your message to send
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={(val: any) => setMessageType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">WhatsApp/SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={10}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{name}'}, {'{event}'}, {'{stall_number}'}
              </p>
            </div>

            <Button
              onClick={handleSend}
              disabled={sending || !message.trim() || selectedRecipients.length === 0}
              className="w-full"
            >
              <Send size={16} color="currentColor" variant="Linear" /> {/* Replaced Send */}
              {sending ? 'Sending...' : `Send to ${selectedRecipients.length} Recipients`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto p-4"
            onClick={() => setMessage('Hello {name},\n\nYour stall registration has been approved! Your assigned stall number is #{stall_number}.\n\nEvent: {event}\n\nSee you at the event!')}
          >
            <div className="space-y-1">
              <p className="font-medium">Approval Notification</p>
              <p className="text-xs text-muted-foreground">Notify about stall approval with number</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto p-4"
            onClick={() => setMessage('Dear {name},\n\nThis is a reminder about the upcoming event: {event}\n\nPlease ensure you arrive on time and bring all necessary materials.\n\nBest regards,\nEvent Team')}
          >
            <div className="space-y-1">
              <p className="font-medium">Event Reminder</p>
              <p className="text-xs text-muted-foreground">Send reminder before event starts</p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}