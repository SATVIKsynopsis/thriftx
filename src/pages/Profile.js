import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Camera,
  Shield,
  Bell,
  CreditCard
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfileContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

const ProfileContent = styled.div`
  display: grid;
  gap: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #2563eb;
  border-radius: 0.5rem;
  color: white;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const ProfileImageSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProfileImageContainer = styled.div`
  position: relative;
`;

const ProfileImage = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
`;

const ImageUploadButton = styled.button`
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  width: 2rem;
  height: 2rem;
  background: #2563eb;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  
  &:hover {
    background: #1d4ed8;
  }
`;

const ProfileImageInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ProfileEmail = styled.p`
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const ProfileRole = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
  
  &:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1d4ed8;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Toggle = styled.button`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: ${props => props.enabled ? '#2563eb' : '#d1d5db'};
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: ${props => props.enabled ? '1.375rem' : '0.125rem'};
    width: 1.25rem;
    height: 1.25rem;
    background: white;
    border-radius: 50%;
    transition: all 0.2s;
  }
`;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });
  
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: userProfile?.name || currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      city: userProfile?.city || '',
      state: userProfile?.state || '',
      zipCode: userProfile?.zipCode || '',
      bio: userProfile?.bio || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: data.name
      });
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bio: data.bio,
        updatedAt: new Date()
      });
      
      // Refresh user profile
      await fetchUserProfile(currentUser.uid);
      
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    toast.success(`${type} notifications ${notifications[type] ? 'disabled' : 'enabled'}`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ProfileContainer>
      <Container>
        <Header>
          <Title>Profile Settings</Title>
          <Subtitle>Manage your account information and preferences</Subtitle>
        </Header>

        <ProfileContent>
          <Card>
            <CardHeader>
              <CardIcon>
                <User size={20} />
              </CardIcon>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>

            <ProfileImageSection>
              <ProfileImageContainer>
                <ProfileImage>
                  {getInitials(userProfile?.name || currentUser?.displayName)}
                </ProfileImage>
                <ImageUploadButton>
                  <Camera size={12} />
                </ImageUploadButton>
              </ProfileImageContainer>
              
              <ProfileImageInfo>
                <ProfileName>
                  {userProfile?.name || currentUser?.displayName || 'User'}
                </ProfileName>
                <ProfileEmail>{currentUser?.email}</ProfileEmail>
                <ProfileRole>{userProfile?.role || 'buyer'}</ProfileRole>
              </ProfileImageInfo>
            </ProfileImageSection>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormRow columns="1fr 1fr">
                <FormGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled
                  />
                </FormGroup>
              </FormRow>

              <FormRow columns="1fr 1fr">
                <FormGroup>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="(555) 123-4567"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="123 Main St"
                  />
                </FormGroup>
              </FormRow>

              <FormRow columns="2fr 1fr 1fr">
                <FormGroup>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="San Francisco"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="CA"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    placeholder="94102"
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="bio">Bio</Label>
                <TextArea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us about yourself..."
                />
              </FormGroup>

              <SaveButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </SaveButton>
            </Form>
          </Card>

          <Card>
            <CardHeader>
              <CardIcon>
                <Bell size={20} />
              </CardIcon>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>Email Notifications</SettingTitle>
                <SettingDescription>
                  Receive updates about your orders and account
                </SettingDescription>
              </SettingInfo>
              <Toggle
                enabled={notifications.email}
                onClick={() => toggleNotification('email')}
              />
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>Push Notifications</SettingTitle>
                <SettingDescription>
                  Get real-time notifications in your browser
                </SettingDescription>
              </SettingInfo>
              <Toggle
                enabled={notifications.push}
                onClick={() => toggleNotification('push')}
              />
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>SMS Notifications</SettingTitle>
                <SettingDescription>
                  Receive text messages for important updates
                </SettingDescription>
              </SettingInfo>
              <Toggle
                enabled={notifications.sms}
                onClick={() => toggleNotification('sms')}
              />
            </SettingItem>
          </Card>

          <Card>
            <CardHeader>
              <CardIcon>
                <Shield size={20} />
              </CardIcon>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>Two-Factor Authentication</SettingTitle>
                <SettingDescription>
                  Add an extra layer of security to your account
                </SettingDescription>
              </SettingInfo>
              <SaveButton 
                type="button"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Enable
              </SaveButton>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>Change Password</SettingTitle>
                <SettingDescription>
                  Update your account password
                </SettingDescription>
              </SettingInfo>
              <SaveButton 
                type="button"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Change
              </SaveButton>
            </SettingItem>
          </Card>
        </ProfileContent>
      </Container>
    </ProfileContainer>
  );
};

export default Profile;
