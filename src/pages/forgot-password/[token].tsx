import React, { useEffect, useState } from "react";
import { Button, Typography } from '@material-ui/core';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { useRouter } from "next/router";
import client from "../../components/config/Apollo";
import { gql } from "apollo-boost";
import { decodeResetPasswordLink } from "../../services/decode-link";

// TODO: add a reset password button somewhere

type FormUpdate = React.ChangeEvent<HTMLInputElement>;

const RESET_PASSWORD_MUTATION = gql`
  mutation resetPassword($userId: String!, $newPassword: String!) {
    resetPassword(userId: $userId, newPassword: $newPassword)
  }
`;

const ForgotPasswordForm = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [linkValidationInProgress, setLinkValidationInProgress] = useState(true);

  const router = useRouter();

  // Execute once on initial page load
  useEffect(() => {
    // Check that URL is a proper URL for resetting a password 
    const token: any = router.query.token;
    console.log('token is: ' + token);

    // Store userId
    try {
      const userId: string = decodeResetPasswordLink(token);
      setUserId(userId);
      console.log('> URL is valid');
      setLinkValidationInProgress(false);
    }
    catch(error) {
      setError("URL is not valid");
      setLinkValidationInProgress(false);
    }

    ValidatorForm.addValidationRule('isPasswordMatch', (value: string) => {
      return value === password;
    });
  }, []); // This arg is an empty array in order to only execute this effect once


  // Takes a field name and returns a function that changes that field to
  // the event value and stores it in the state
  function handleFieldChange(field: string): ((e: FormUpdate) => void) {
    return (e: FormUpdate) => {
      if (field === "password") {
        setPassword(e.target.value);
      }
      else if (field === "confirmPassword") {
        setConfirmPassword(e.target.value);
      }
    }
  }

  function handleSubmitForgotPassword() {
    client.mutate({
      mutation: RESET_PASSWORD_MUTATION,
      variables: {
        userId: userId,
        newPassword: password,
      }
    }).then(() => {
      // TODO : Redirect to different page
      console.log('> Successfully reset password');
    }).catch((error: any) => {
      console.log(error)
    })
  }

  // If the link is invalid, render a 404 error
  if (error) {
    return(<div>404 Page Not Found</div>);
  }
  else if (linkValidationInProgress) {
    // TODO: change to a loader icon
    return(<div>Link is currently being validated...</div>);
  }

  // If the link is valid, render the form to reset the password
  return (
    <ValidatorForm onSubmit={handleSubmitForgotPassword} style={{
      padding: "20px",
      marginTop: "40px",
      backgroundColor: "white",
      borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
      boxShadow: "0 1px 5px rgba(0, 0, 0, 0.15)"
    }}>
      <Typography variant="h5">Forgot your password? Reset it here!</Typography>
      <TextValidator 
        type="password" 
        placeholder="Enter your Password" 
        label="Password" 
        name="password"
        onChange={handleFieldChange("password")}
        validators={['required', 'matchRegexp:.{8,}']}
        errorMessages={['Required', 'Password must be longer than 8 characters']}
        value={password}
        style={{ margin: "10px 0" }}
        error={error != ""}
        helperText={error == "" ? "" : error}
        fullWidth />
      <br />
      <TextValidator 
        type="password" 
        placeholder="Confirm Password" 
        label="Confirm Password" 
        name="confirm_password"
        onChange={handleFieldChange("confirmPassword")}
        validators={['required', 'isPasswordMatch']}
        errorMessages={['Required', 'Passwords don\'t match']}
        value={confirmPassword}
        style={{ margin: "10px 0" }}
        fullWidth />
      <br />
      <Button 
        style={{ margin: "10px 0" }} 
        variant="contained" 
        color="primary" 
        type="submit">Reset password</Button>
    </ValidatorForm>
  );
}

export default ForgotPasswordForm