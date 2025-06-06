"use client";

import { Info } from "lucide-react";
import React from 'react';

const EmptyState = ({ message }) => (
  <div className="text-center py-10">
    <Info size={32} className="mx-auto text-gray-400 mb-2" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default EmptyState;