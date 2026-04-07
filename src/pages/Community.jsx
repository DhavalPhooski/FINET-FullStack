import React, { useState, useEffect } from 'react'
import { Users2, MessageSquare, Award, Flame, Zap, ArrowUp, Plus, History, CheckCircle2, ShieldCheck, Trophy, Edit3, Activity, Compass, Loader } from 'lucide-react'
import api from '../utils/api'

const TAG_COLORS = { success: 'badge-green', question: 'badge-cyan', tip: 'badge-purple', discussion: 'badge-yellow' }
const TABS = ['All', 'Success Stories', 'Questions', 'Tips', 'Discussions']

export default function Community() {
    const [tab, setTab] = useState('All')
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPost, setShowPost] = useState(false)
    const [expandedId, setExpandedId] = useState(null)
    const [newPostTitle, setNewPostTitle] = useState('')
    const [newPostContent, setNewPostContent] = useState('')
    const [newPostCategory, setNewPostCategory] = useState('Query')
    const [creatingPost, setCreatingPost] = useState(false)
    const [error, setError] = useState('')

    // Fetch posts on mount and when tab changes
    useEffect(() => {
        fetchPosts()
    }, [tab])

    const fetchPosts = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await api.get('/community/posts', {
                params: { category: tab }
            })
            setPosts(response.data.posts || [])
        } catch (err) {
            console.error('Failed to fetch posts:', err)
            setError('Failed to load posts. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleUpvote = async (postId) => {
        try {
            const response = await api.post(`/community/posts/${postId}/upvote`)
            
            // Update local state
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        votes: response.data.votes,
                        userVoted: !post.userVoted
                    }
                }
                return post
            }))
        } catch (err) {
            console.error('Failed to upvote post:', err)
        }
    }

    const handleCreatePost = async (e) => {
        e.preventDefault()
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            setError('Title and content are required')
            return
        }

        setCreatingPost(true)
        setError('')
        
        try {
            await api.post('/community/posts', {
                title: newPostTitle,
                content: newPostContent,
                category: newPostCategory
            })

            // Reset form and fetch updated posts
            setNewPostTitle('')
            setNewPostContent('')
            setNewPostCategory('Query')
            setShowPost(false)
            await fetchPosts()
        } catch (err) {
            console.error('Failed to create post:', err)
            setError('Failed to create post. Please try again.')
        } finally {
            setCreatingPost(false)
        }
    }

    const filtered = posts.filter(p => {
        if (tab === 'All') return true
        return p.category === p.tag
    })

    return (
        <div className="anim-fade">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Social Intelligence</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Real people sharing real journeys. Get upvoted for insights that move the community.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowPost(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    <Plus size={16} style={{ marginRight: 4 }} /> SHARE YOUR JOURNEY
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                {/* Left: Posts */}
                <div>
                    {/* Tabs */}
                    <div className="tabs" style={{ marginBottom: 24 }}>
                        {TABS.map(t => (
                            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
                        ))}
                    </div>

                    {error && (
                        <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', marginBottom: 16, color: 'rgb(239, 68, 68)', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: 12, color: 'var(--text-muted)' }}>
                            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            Loading posts...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '0.95rem' }}>No posts yet in this category.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Be the first to share your journey! 🚀</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {filtered.map(post => (
                                <div key={post.id} className="card" style={{ display: 'flex', gap: 16, padding: '24px', background: 'var(--bg-deep)' }}>
                                    {/* Vote button */}
                                    <button
                                        onClick={() => handleUpvote(post.id)}
                                        style={{
                                            background: post.userVoted ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            border: `1px solid ${post.userVoted ? 'var(--text-primary)' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: 'var(--radius-sm)', width: 48, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, cursor: 'pointer', flexShrink: 0,
                                            transition: 'all 0.2s', color: post.userVoted ? 'var(--text-primary)' : 'var(--text-muted)'
                                        }}>
                                        <ArrowUp size={16} style={{ marginBottom: 4 }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{post.votes}</span>
                                    </button>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                            <span className={`badge ${TAG_COLORS[post.tag]}`}>{post.category.toUpperCase()}</span>
                                            {post.authorBadge === 'mentor' && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>MENTOR</span>}
                                            {post.authorBadge === 'verified' && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>VERIFIED</span>}
                                        </div>

                                        <div
                                            style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 8, cursor: 'pointer', color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.01em' }}
                                            onClick={() => setExpandedId(prev => prev === post.id ? null : post.id)}
                                        >
                                            {post.title}
                                        </div>

                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                                            {expandedId === post.id ? post.content : post.content.slice(0, 140) + (post.content.length > 140 ? '…' : '')}
                                            {post.content.length > 140 && (
                                                <button onClick={() => setExpandedId(prev => prev === post.id ? null : post.id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginLeft: 8 }}>
                                                    {expandedId === post.id ? 'Collapse ↑' : 'Expand ↓'}
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                            {post.tags && post.tags.map(t => (
                                                <span key={t} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>#{t.toUpperCase()}</span>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem' }}>{post.avatar}</div>
                                                <strong style={{ color: 'var(--text-secondary)' }}>{post.author}</strong>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {post.comments} COMMENTS</span>
                                            <span>{post.time.toUpperCase()}</span>
                                            {post.hot && <span style={{ color: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={12} /> HOT</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Community Stats */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} color="var(--text-muted)" /> NETWORK STATUS</div>
                        {[
                            ['TOTAL TALKS', posts.length.toString()],
                            ['HOT POSTS', posts.filter(p => p.hot).length.toString()],
                            ['YOUR UPVOTES', posts.filter(p => p.userVoted).length.toString()],
                        ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Info Card */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Compass size={16} color="var(--accent-indigo)" /> HOW IT WORKS</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <div style={{ marginBottom: 12 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>🚀 Share</strong><br />
                                Post your wins, questions, or insights
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>👍 Vote</strong><br />
                                Upvote talks that helped you
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>🌟 Learn</strong><br />
                                See what the community values
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Post Modal */}
            {showPost && (
                <div className="modal-overlay" onClick={() => setShowPost(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title" style={{ fontSize: '1.2rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Edit3 size={18} /> SHARE YOUR JOURNEY
                        </div>

                        {error && (
                            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', marginBottom: 16, color: 'rgb(239, 68, 68)', fontSize: '0.9rem' }}>
                                {error}
                            </div>
                        )}

                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label className="input-label">Title</label>
                            <input 
                                className="input" 
                                placeholder="What's your story?" 
                                value={newPostTitle}
                                onChange={e => setNewPostTitle(e.target.value)}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label className="input-label">Story</label>
                            <textarea 
                                className="input" 
                                rows={5} 
                                placeholder="Share your experience, question, or insight..." 
                                style={{ resize: 'vertical' }}
                                value={newPostContent}
                                onChange={e => setNewPostContent(e.target.value)}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: 24 }}>
                            <label className="input-label">Type</label>
                            <select 
                                className="input"
                                value={newPostCategory}
                                onChange={e => setNewPostCategory(e.target.value)}
                            >
                                <option>Query</option>
                                <option>Tactical Success</option>
                                <option>Intelligence Tip</option>
                                <option>Open Discussion</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ flex: 1 }} 
                                onClick={handleCreatePost}
                                disabled={creatingPost}
                            >
                                {creatingPost ? (
                                    <>
                                        <Loader size={14} style={{ marginRight: 4, animation: 'spin 1s linear infinite', display: 'inline' }} />
                                        SHARING...
                                    </>
                                ) : (
                                    'SHARE WITH COMMUNITY'
                                )}
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setShowPost(false)}
                                disabled={creatingPost}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
