import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, X } from 'lucide-react';

const LineItem = ({ item, index, onUpdate, onRemove }) => {
    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-2 p-2 bg-white border border-gray-100 rounded mb-2 ${snapshot.isDragging ? 'shadow-lg border-blue-200' : ''
                        }`}
                >
                    {/* Drag Handle */}
                    <div
                        {...provided.dragHandleProps}
                        className="text-gray-400 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Item Name */}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">₹{item.price.toFixed(2)}</div>
                    </div>

                    {/* Qty */}
                    <div className="w-20">
                        <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val > 0) onUpdate(item.id, { qty: val });
                            }}
                            className="w-full p-1 border rounded text-center text-sm"
                        />
                    </div>

                    {/* Total */}
                    <div className="w-20 text-right font-medium text-sm">
                        ₹{item.total.toFixed(2)}
                    </div>

                    {/* Delete */}
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </Draggable>
    );
};

export default LineItem;
