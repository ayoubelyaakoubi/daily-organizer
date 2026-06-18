import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Edit2, Check, GripVertical } from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import useStore from '../store/useStore'

const PRESET_EMOJIS = [
  '🎯', '📚', '🏃', '💼', '🍎', '💪', '🧘', '✍️',
  '💻', '🎨', '🌱', '🔥', '⭐', '🎵', '🌙', '🎮',
  '🚀', '📝', '🏋️', '🍵', '🌊', '🎤', '🧠', '🏆',
]

const EMOJI_LABELS = {
  '🎯': 'Objectif',    '📚': 'Étude',        '🏃': 'Sport',
  '💼': 'Travail',     '🍎': 'Nutrition',     '💪': 'Fitness',
  '🧘': 'Méditation',  '✍️': 'Écriture',     '💻': 'Coding',
  '🎨': 'Créativité',  '🌱': 'Croissance',    '🔥': 'Motivation',
  '⭐': 'Excellence',  '🎵': 'Musique',        '🌙': 'Soir',
  '🎮': 'Loisir',     '🚀': 'Ambition',       '📝': 'Notes',
  '🏋️': 'Musculation','🍵': 'Bien-être',     '🌊': 'Calme',
  '🎤': 'Expression',  '🧠': 'Réflexion',     '🏆': 'Victoire',
}

// ── Semi-circle Emoji Picker ──────────────────────────────────────────────────
// Layout: trigger button = CENTER of the circle, arc opens to the LEFT
// Angles 90° (top) → 180° (far left) → 270° (bottom)

const RADIUS    = 82
const EMOJI_BTN = 34
const NAV_SIZE  = 26
const STEP_DEG  = 360 / PRESET_EMOJIS.length
const SVG_HALF  = RADIUS + EMOJI_BTN + 10

function EmojiPicker({ value, onChange }) {
  const [open, setOpen]           = useState(false)
  const [rotation, setRotation]   = useState(0)
  const [pos, setPos]             = useState({ x: 0, y: 0 })  // trigger CENTER
  const [tooltip, setTooltip]     = useState(null)
  const triggerRef = useRef(null)
  const pickerRef  = useRef(null)

  useEffect(() => {
    if (!open) return
    const close  = () => setOpen(false)
    const onDown = (e) => {
      if (!triggerRef.current?.contains(e.target) && !pickerRef.current?.contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      // Place portal origin at the CENTER of the trigger button
      setPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    }
    setOpen((v) => !v)
  }

  // LEFT semi-circle: angles 90° (top) to 270° (bottom), going through 180° (far left)
  const getAngle  = (i)     => ((STEP_DEG * i + rotation) % 360 + 360) % 360
  const isVisible = (angle) => angle >= 82 && angle <= 278
  const getXY     = (angle) => {
    const rad = (angle * Math.PI) / 180
    // cos(90-270) is 0 to -1 to 0  → emojis spread LEFT
    // sin(90-270) flipped → emojis spread UP and DOWN
    return { x: RADIUS * Math.cos(rad), y: -RADIUS * Math.sin(rad) }
  }
  const scroll = (dir) => setRotation((r) => r + dir * STEP_DEG)

  const picker = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={pickerRef}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            // Portal origin = trigger button CENTER
            position     : 'fixed',
            left         : pos.x,
            top          : pos.y,
            width        : 0,
            height       : 0,
            zIndex       : 99999,
            overflow     : 'visible',
            pointerEvents: 'none',
          }}
        >
          {/* SVG: left semi-circle arc (90° → 270° going through 180°) */}
          <svg
            style={{
              position     : 'absolute',
              left         : -SVG_HALF,
              top          : -SVG_HALF,
              width        : SVG_HALF * 2,
              height       : SVG_HALF * 2,
              overflow     : 'visible',
              pointerEvents: 'none',
            }}
          >
            <g transform={`translate(${SVG_HALF}, ${SVG_HALF})`}>
              {/* Dashed left semi-circle: M 0,-R  arc to  0,+R  going LEFT */}
              <path
                d={`M 0 -${RADIUS} A ${RADIUS} ${RADIUS} 0 0 0 0 ${RADIUS}`}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
                strokeDasharray="3 7"
              />
              {/* Glowing center ring (trigger center) */}
              <circle cx="0" cy="0" r="6"
                fill="rgba(99,102,241,0.2)"
                stroke="rgba(99,102,241,0.55)"
                strokeWidth="1.5"
              />
            </g>
          </svg>

          {/* Emoji buttons — anchored to portal origin (trigger center) */}
          {PRESET_EMOJIS.map((emoji, i) => {
            const angle    = getAngle(i)
            const visible  = isVisible(angle)
            const { x, y } = getXY(angle)
            const isSel    = emoji === value

            return (
              <motion.button
                key={emoji}
                type="button"
                onClick={() => { onChange(emoji); setOpen(false); setTooltip(null) }}
                onMouseEnter={(e) => {
                  if (!visible) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({
                    label: EMOJI_LABELS[emoji] || emoji,
                    x    : rect.left + rect.width / 2,
                    y    : rect.top - 10,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
                animate={{
                  x,
                  y,
                  opacity: visible ? 1 : 0,
                  scale  : isSel && visible ? 1.2 : visible ? 1 : 0.05,
                }}
                whileHover={visible ? { scale: 1.55, zIndex: 9999 } : undefined}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={{
                  position       : 'absolute',
                  width          : EMOJI_BTN,
                  height         : EMOJI_BTN,
                  // center the emoji on the arc point
                  marginLeft     : -EMOJI_BTN / 2,
                  marginTop      : -EMOJI_BTN / 2,
                  pointerEvents  : visible ? 'auto' : 'none',
                  fontSize       : '1.1rem',
                  borderRadius   : '50%',
                  border         : `2px solid ${isSel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: isSel ? 'rgba(99,102,241,0.38)' : 'rgba(10,18,40,0.93)',
                  backdropFilter : 'blur(14px)',
                  boxShadow      : isSel ? '0 0 16px rgba(99,102,241,0.5)' : '0 2px 8px rgba(0,0,0,0.4)',
                  display        : 'flex',
                  alignItems     : 'center',
                  justifyContent : 'center',
                  cursor         : 'pointer',
                }}
              >
                {emoji}
              </motion.button>
            )
          })}

          {/* ▲ nav — appears above the arc (top endpoint: 0, -RADIUS) */}
          <motion.button
            type="button"
            onClick={() => scroll(-1)}
            whileHover={{ scale: 1.25, backgroundColor: 'rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.85 }}
            style={{
              position       : 'absolute',
              left           : -(NAV_SIZE / 2),
              top            : -(RADIUS + EMOJI_BTN / 2 + 12),
              pointerEvents  : 'auto',
              width          : NAV_SIZE,
              height         : NAV_SIZE,
              borderRadius   : '50%',
              backgroundColor: 'rgba(30,41,59,0.95)',
              border         : '1px solid rgba(255,255,255,0.2)',
              display        : 'flex',
              alignItems     : 'center',
              justifyContent : 'center',
              cursor         : 'pointer',
              color          : 'rgba(255,255,255,0.8)',
              fontSize       : '12px',
            }}
          >▲</motion.button>

          {/* ▼ nav — appears below the arc (bottom endpoint: 0, +RADIUS) */}
          <motion.button
            type="button"
            onClick={() => scroll(1)}
            whileHover={{ scale: 1.25, backgroundColor: 'rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.85 }}
            style={{
              position       : 'absolute',
              left           : -(NAV_SIZE / 2),
              top            : RADIUS + EMOJI_BTN / 2 + 12,
              pointerEvents  : 'auto',
              width          : NAV_SIZE,
              height         : NAV_SIZE,
              borderRadius   : '50%',
              backgroundColor: 'rgba(30,41,59,0.95)',
              border         : '1px solid rgba(255,255,255,0.2)',
              display        : 'flex',
              alignItems     : 'center',
              justifyContent : 'center',
              cursor         : 'pointer',
              color          : 'rgba(255,255,255,0.8)',
              fontSize       : '12px',
            }}
          >▼</motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Tooltip portal — always on top
  const tooltipPortal = (
    <AnimatePresence>
      {tooltip && (
        <motion.div
          key={tooltip.label}
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.13 }}
          style={{
            position     : 'fixed',
            left         : tooltip.x,
            top          : tooltip.y,
            transform    : 'translate(-50%, -100%)',
            zIndex       : 999999,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            backgroundColor: 'rgba(10,15,35,0.97)',
            border         : '1px solid rgba(99,102,241,0.55)',
            borderRadius   : 8,
            padding        : '4px 10px',
            color          : '#e2e8f0',
            fontSize       : '11px',
            fontWeight     : 600,
            whiteSpace     : 'nowrap',
            backdropFilter : 'blur(12px)',
            boxShadow      : '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            {tooltip.label}
          </div>
          <div style={{
            position   : 'absolute',
            bottom     : -5,
            left       : '50%',
            transform  : 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft : '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop  : '5px solid rgba(99,102,241,0.55)',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          width          : 48, height: 48,
          borderRadius   : 12,
          fontSize       : '1.5rem',
          display        : 'flex',
          alignItems     : 'center',
          justifyContent : 'center',
          cursor         : 'pointer',
          backgroundColor: open ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
          border         : `1.5px solid ${open ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.12)'}`,
          boxShadow      : open ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
          transition     : 'all 0.15s',
          flexShrink     : 0,
        }}
      >
        {value}
      </motion.button>

      {ReactDOM.createPortal(picker, document.body)}
      {ReactDOM.createPortal(tooltipPortal, document.body)}
    </>
  )
}

// ── Objective row ─────────────────────────────────────────────────────────────

function ObjectiveRow({ obj, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group"
    >
      <GripVertical size={15} className="text-slate-600 shrink-0" />
      <span className="text-lg shrink-0">{obj.emoji}</span>
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: obj.color }} />
      <span className="flex-1 text-sm font-medium text-slate-200 truncate">{obj.title}</span>
      <button onClick={() => onEdit(obj)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
        <Edit2 size={13} />
      </button>
      <button onClick={() => onDelete(obj.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400">
        <Trash2 size={13} />
      </button>
    </motion.div>
  )
}

// ── Objective form ────────────────────────────────────────────────────────────

function ObjectiveForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [color, setColor] = useState(initial?.color || '#6366f1')
  const [emoji, setEmoji] = useState(initial?.emoji || '🎯')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), color, emoji })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom de l'objectif..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
          autoFocus
        />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">Couleur</p>
        <div className="color-picker-wrap">
          <HexColorPicker color={color} onChange={setColor} />
          <div className="flex items-center gap-2 mt-3">
            <div
              className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span className="text-slate-500 text-xs font-mono">#</span>
              <HexColorInput
                color={color}
                onChange={setColor}
                style={{
                  background  : 'transparent',
                  border      : 'none',
                  outline     : 'none',
                  color       : '#e2e8f0',
                  fontSize    : '13px',
                  fontFamily  : 'monospace',
                  fontWeight  : 600,
                  width       : '100%',
                  letterSpacing: '0.05em',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors">
          Annuler
        </button>
        <button type="submit"
          className="flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white transition-all"
          style={{ backgroundColor: color }}>
          <Check size={14} />
          {initial ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function ObjectivesModal({ onClose }) {
  const { objectives, addObjective, updateObjective, deleteObjective } = useStore()
  const [mode, setMode]           = useState('list')
  const [editTarget, setEditTarget] = useState(null)

  const handleAdd  = (data) => { addObjective({ id: `obj-${Date.now()}`, ...data }); setMode('list') }
  const handleEdit = (data) => { updateObjective(editTarget.id, data); setMode('list'); setEditTarget(null) }
  const startEdit  = (obj)  => { setEditTarget(obj); setMode('edit') }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl"
        style={{ overflow: 'visible' }}
      >
        <div className="rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900">
            <div>
              <h2 className="text-lg font-bold text-white">Mes Objectifs</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {objectives.length} objectif{objectives.length !== 1 ? 's' : ''} défini{objectives.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4 bg-slate-900">
            <AnimatePresence mode="wait">
              {mode === 'list' && (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <AnimatePresence>
                    {objectives.map((obj) => (
                      <ObjectiveRow key={obj.id} obj={obj} onEdit={startEdit} onDelete={(id) => deleteObjective(id)} />
                    ))}
                  </AnimatePresence>
                  {objectives.length === 0 && (
                    <p className="text-center text-slate-500 text-sm py-8">Aucun objectif. Ajoute le premier !</p>
                  )}
                </motion.div>
              )}
              {mode === 'add' && (
                <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Nouvel objectif</h3>
                  <ObjectiveForm onSave={handleAdd} onCancel={() => setMode('list')} />
                </motion.div>
              )}
              {mode === 'edit' && editTarget && (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Modifier l'objectif</h3>
                  <ObjectiveForm initial={editTarget} onSave={handleEdit} onCancel={() => setMode('list')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {mode === 'list' && (
            <div className="p-6 border-t border-white/10 bg-slate-900">
              <button
                onClick={() => setMode('add')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Ajouter un objectif
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
