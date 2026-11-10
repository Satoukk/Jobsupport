package routes

import (
	"sync"
	"time"
)

type attempts struct {
	count int
	until time.Time
}
type authLimiter struct {
	mu      sync.Mutex
	clients map[string]attempts
}

func newAuthLimiter() *authLimiter { return &authLimiter{clients: make(map[string]attempts)} }
func (l *authLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	// Expire buckets so the in-memory limiter does not grow indefinitely.
	for key, entry := range l.clients {
		if now.After(entry.until) {
			delete(l.clients, key)
		}
	}
	entry := l.clients[ip]
	if entry.until.IsZero() {
		entry.until = now.Add(time.Minute)
	}
	if entry.count >= 30 {
		return false
	}
	entry.count++
	l.clients[ip] = entry
	return true
}
