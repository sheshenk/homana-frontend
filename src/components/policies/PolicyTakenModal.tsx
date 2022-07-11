import { useMutation } from "@apollo/client"
import { Avatar, Badge, Button, Group, Modal, Stack, Text, Title } from "@mantine/core"
import { useContext, useState } from "react"
import { POLICY_TAKEN_CANCEL, POLICY_TAKEN_NEXT_STEP, UPDATE_CLIENT_ID } from "../../queries/policyTaken"
import { UserContext } from "../../services/userContextProvider"
import { Callbacks } from "../../types/callbacks"
import { PolicyTaken } from "../../types/policy"
import ptBadgeColor from "../../utils/ptBadgeColor"
import { signDocumentClient, approveDocumentBC, rejectDocumentBC, getSignerAddress } from "../../utils/contractUtils"
interface PolicyTakenModalProps {
	policyTaken: PolicyTaken | null
	close: () => void
	callbacks: Callbacks<PolicyTaken>
}

function PolicyTakenModal(props: PolicyTakenModalProps) {
	const { user } = useContext(UserContext)
	const [client, setClient] = useState('')

	const [policyNext] = useMutation(POLICY_TAKEN_NEXT_STEP, {
		variables: { _id: props.policyTaken?._id, status: props.policyTaken?.status},
		onCompleted: ({ policyTakenNext }) => {
			if (policyTakenNext.response && props.policyTaken) {
				props.callbacks.update({...props.policyTaken, status: policyTakenNext.response})
				props.close()
			} else {
				console.log(policyTakenNext.error)
			}
		}
	})

	const [updateClient] = useMutation(UPDATE_CLIENT_ID, {
		variables: {_id: props.policyTaken?._id, clientId: client || null},
		onCompleted: ({ policyTakenNext }) => {
			if (policyTakenNext.response && props.policyTaken) {
				props.callbacks.update({clientId: client, ...props.policyTaken, status: policyTakenNext.response})
				props.close()
			} else {
				console.log(policyTakenNext.error)
			}
		}
	})

	const handlePolicyNext = (id: any) => {
		policyNext();
		if (user?.__typename === 'Broker') { 
			approveDocumentBC(id)
		} else {
			getSignerAddress().then(res => setClient(res));
			updateClient();
			signDocumentClient(id);
		}
	}

	const [policyCancel] = useMutation(POLICY_TAKEN_CANCEL, {
		variables: { _id: props.policyTaken?._id, status: props.policyTaken?.status},
		onCompleted: ({ policyTakenCancel }) => {
			if (policyTakenCancel.response && props.policyTaken) {
				props.callbacks.update({...props.policyTaken, status: policyTakenCancel.response})
				props.close()
			} else {
				console.log(policyTakenCancel.error)
			}
		}
	})

	const handlePolicyCancel = (id: any) => {
		policyCancel();
		rejectDocumentBC(id);
	}

	return (
		<Modal opened={!!props.policyTaken} onClose={props.close} title={props.policyTaken?.policy?.title} styles={{title: { fontWeight: 'bold', fontSize: 22, }, header: { marginBottom: 4}}}>
			<Badge size="md" color={ptBadgeColor(props.policyTaken?.status || '')}>{props.policyTaken?.status}</Badge>
			<Stack spacing={36} mt={36}>
				<Stack spacing='xs'>
					<Title order={4}>Agent Details</Title>
					<Group>
						<Avatar size='md' color='grape'>{props.policyTaken?.agent?.name?.charAt(0)}</Avatar>
						<Stack spacing={0}>
							<Text size="sm">{props.policyTaken?.agent?.name}</Text>
							<Text size="xs" color='dimmed'>{props.policyTaken?.agent?.email}</Text>
						</Stack>
					</Group>
				</Stack>
				<Stack spacing='xs'>
					<Title order={4}>Quotation Details</Title>
					<Group>
						<Stack spacing={0}>
							<Group mb='sm'>
								<Text size="sm" weight='bold'>Policy Title</Text>
								<Text size="sm">{props.policyTaken?.policy?.title}</Text>
							</Group>
							<Group>
								<Text size="sm" weight='bold'>Insured Amount</Text>
								<Text size="sm">S$ {props.policyTaken?.insuredAmount}</Text>
							</Group>
							<Group>
								<Text size="sm" weight='bold'>Monthly Premium</Text>
								<Text size="sm">S$ {props.policyTaken?.premium}</Text>
							</Group>
						</Stack>
					</Group>
				</Stack>
				{
					(((user?.__typename === 'Client' && props.policyTaken?.status === 'QUOTED')) || ((user?.__typename === 'Broker' && props.policyTaken?.status === 'APPLIED'))) && (
						<>
							<Stack spacing='xs' py='sm'>
								<Group position="apart">
									<Button onClick={() => handlePolicyNext(0)}>Sign and {user.__typename === 'Broker'? 'Approve' : 'Apply'}</Button>
									<Button color='red' onClick={() => handlePolicyCancel(0)}>Reject</Button>
								</Group>
								<Text size='xs' color='dimmed'>By clicking Sign and {user.__typename === 'Broker'? 'Approve' : 'Apply'}, ...</Text>
							</Stack>
						</>
					)
				}
			</Stack>
		</Modal>
	)
}

export default PolicyTakenModal