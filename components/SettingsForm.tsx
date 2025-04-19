import { SettingsFormData, settingsSchema } from '@/lib/schemas';
import { useAuthUser } from '@/state/auth-hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CustomFormField } from './FormField';
import { Button } from './ui/button';
import { Form } from './ui/form';

interface SettingsFormProps {
  initialData: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  onSubmit: (data: SettingsFormData) => void;
  userType: 'tenant' | 'manager';
  isPending?: boolean;
}

const SettingsForm = ({
  initialData,
  onSubmit,
  userType,
  isPending = false,
}: SettingsFormProps) => {
  const queryClient = useQueryClient();
  const { refetch } = useAuthUser();
  const [editMode, setEditMode] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      form.reset(initialData);
    }
  };

  const handleSubmit = async (data: SettingsFormData) => {
    try {
      const response = await onSubmit(data);
      if (response !== undefined) {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['authUser'] });
        await refetch();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setEditMode(false);
    }
  };

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">
          {`${userType.charAt(0).toUpperCase() + userType.slice(1)} Settings`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>
      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CustomFormField name="name" label="Name" disabled={!editMode} />
            <CustomFormField
              name="email"
              label="Email"
              type="email"
              disabled={!editMode}
            />
            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              disabled={!editMode}
            />

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                onClick={toggleEditMode}
                disabled={isPending}
                className="bg-gray-500 text-white hover:bg-pink-600"
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
              {editMode && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-pink-700 text-white hover:bg-pink-800"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
export default SettingsForm;
