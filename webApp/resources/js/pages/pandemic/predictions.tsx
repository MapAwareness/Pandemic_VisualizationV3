import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pandemic Predictions',
        href: '/pandemic/predictions',
    },
];

type PredictionForm = {
    name: string;
    email: string;
};

export default function Predictions() {
    const { data, setData, post, processing, errors } = useForm<Required<PredictionForm>>({
        disease: 
}