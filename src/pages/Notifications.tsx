import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell } from 'lucide-react';

const Notifications = () => {
  const { user, isAuthenticated, fetchUser } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      if (!user) {
        try {
          await fetchUser();
        } catch (err) {
          console.error('Failed to load user before notifications', err);
          return;
        }
      }

      if (!user) return;

      setLoading(true);
      try {
        console.debug('[Notifications] fetching notifications for userId=', user.userId);
        const res = await notificationsApi.getUserNotifications(user.userId, 0, 50);
        console.debug('[Notifications] received response:', res);
        const content = res?.content || [];
        setItems(content);
        try {
          const unread = content.filter((n: any) => !n.read).length;
          window.dispatchEvent(new CustomEvent('notifications:unread', { detail: unread }));
        } catch {}
      } catch (err) {
        console.error('Failed to load notifications', err);
        setItems([]);
        toast({ title: 'Unable to load notifications', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user, fetchUser, toast]);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.debug('[Notifications] manual refresh for userId=', user.userId);
      const res = await notificationsApi.getUserNotifications(user.userId, 0, 50);
      console.debug('[Notifications] manual refresh response:', res);
      const content = res?.content || [];
      setItems(content);
      try {
        const unread = content.filter((n: any) => !n.read).length;
        window.dispatchEvent(new CustomEvent('notifications:unread', { detail: unread }));
      } catch {}
      toast({ title: 'Notifications refreshed' });
    } catch (err) {
      console.error('Failed to refresh notifications', err);
      toast({ title: 'Unable to refresh', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      const updated = items.map((p) => (p.notificationId === id ? { ...p, read: true } : p));
      setItems(updated);
      try {
        const unread = updated.filter((n: any) => !n.read).length;
        window.dispatchEvent(new CustomEvent('notifications:unread', { detail: unread }));
      } catch {}
    } catch (err) {
      console.error('Failed to mark notification read', err);
      toast({ title: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications</div>
          ) : (
            <div className="space-y-3">
              {items.map((n) => (
                <div key={n.notificationId} className={`p-3 rounded-lg border ${n.read ? 'bg-background/50 border-border' : 'bg-primary/5 border-primary/30'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.type} • {n.createdAt ? formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) : ''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!n.read && (
                        <Button size="sm" onClick={() => markRead(n.notificationId)}>Mark read</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
